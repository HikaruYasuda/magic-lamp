# lamp
 
Create and control LAMP (with SMTP) stack by using docker (docker-compose)

## Install

```bash
$ npm install -g magic-lamp
```

## Usage

```bash
$ lamp create // Create docker-compose.yml
$ lamp start // Download images and start docker containers
$ lamp composer require guzzlehttp/guzzle // Use composer
$ lamp exec:db mysql -u lamp -p // Execute command in a db container
$ lamp stop // Stop docker containers
```

## Commands

```bash
$ lamp help
Usage:  lamp [command[:service]] [args...]
Options:
  service   Service to use for docker exec [default: web]
Commands:
  composer  Run a composer command in a running container
  create    Create a docker-compose template file for LAMP stack
  exec      Execute a command in a running container
  help      Show this help
  login     Login to a running container
  php       Run a php command in a running container
  start     Start containers
  stop      Stop running containers
  test      Run the php unit test in a running container
  ...       Run a docker-compose command
Available service names for "lamp create [service...]"
  web       Apache2.4 + PHP7.x (ulsmith/alpine-apache-php7)
  db        MariaDB latest (mariadb)
  smtp      SMTP server for dev (djfarrelly/maildev)
  redis     Redis latest (redis)
```

## License

Copyright (c) 2017 Hikaru Yasuda

This software is released under the MIT License.
http://opensource.org/licenses/mit-license.php
