module.exports = {
  create,
}

function create({ web, db, smtp, redis }) {
  const services = []

  if (web) {
    services.push(`  web:
    image: ulsmith/alpine-apache-php7
    working_dir: /app
    volumes:
      - .:/app
    ports:
      - "8000:80"
    environment:
      - APACHE_SERVER_NAME=localhost
      - WEBAPP_ROOT=public/
`)
  }

  if (db) {
    services.push(`  db:
    image: mariadb
    volumes:
      - /var/lib/mysql
    ports:
      - "3306:3306"
    environment:
      - MYSQL_DATABASE=lamp
      - MYSQL_USER=lamp
      - MYSQL_PASSWORD=password
      - MYSQL_ROOT_PASSWORD=root_pass
`)
  }

  if (smtp) {
    services.push(`  smtp:
      image: djfarrelly/maildev
      ports:
        - "1080:80"
        - "1025:25"
`)
  }

  if (redis) {
    services.push(`  redis:
      image: redis
      ports:
        - "6379:6379"
`)
  }

  return (`version: '2'

services:
${services.join('\n')}
`)
}
