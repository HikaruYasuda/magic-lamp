#!/usr/bin/env node

const {
  dockerCompose,
  dockerExec,
  createTemplate,
} = require('./lib')

const fs = require('fs')
const path = require('path')

const loadJSONFile = path => fs.existsSync(path) && JSON.parse(fs.readFileSync(path)||'false')
const config = loadJSONFile('package.json') || {}
const lampConfig = loadJSONFile('.lamprc') || config['lamp'] || {}
const projectName = config['name'] || lampConfig['name'] || path.basename(path.dirname(process.cwd()))
const defaultExecService = lampConfig['service'] || 'web'
const containerName = service => `${projectName}_${service}_1`

exec_command(process.argv.slice(2))

function usage() {
  console.log([
    'Usage:  lamp [command[:service]] [args...]',
    'Options:',
    '  service   Service to use for docker exec [default: web]',
    'Commands:',
    '  composer  Run a composer command in a running container',
    '  create    Create a docker-compose template file for LAMP stack',
    '  exec      Execute a command in a running container',
    '  help      Show this help',
    '  login     Login to a running container',
    '  php       Run a php command in a running container',
    '  start     Start containers',
    '  stop      Stop running containers',
    '  test      Run the php unit test in a running container',
    '  ...       Run a docker-compose command',
    'Available service names for "lamp create [service...]"',
    '  web       Apache2.4 + PHP7.x (ulsmith/alpine-apache-php7)',
    '  db        MariaDB latest (mariadb)',
    '  smtp      SMTP server for dev (djfarrelly/maildev)',
    '  redis     Redis latest (redis)'
  ].join('\n'))
}

/** @param {Array} args */
function exec_command(args) {
  const [cmd, service = defaultExecService] = ((arg = '') => arg.split(':'))(args.shift())
  const container = containerName(service)
  switch (cmd) {
    case 'start': return dockerCompose(projectName, ['up', '-d', ...args])
    case 'stop': return dockerCompose(projectName, ['stop', ...args])
    case 'exec': return dockerExec(container, args)
    case 'login': return dockerExec(container, ['bash', ...args])
    case 'composer': return dockerExec(container, ['composer', ...args])
    case 'artisan': return dockerExec(container, ['php', 'artisan', ...args])
    case 'test': return dockerExec(container, ['vendor/bin/phpunit', ...args])
    case 'php': return dockerExec(container, ['php', ...args])
    case 'create': return createTemplate(args)
    case '': return usage()
    default:
      if (/^(-v|(--)?version)$/.test(cmd)) return console.log(require(__dirname+'/package.json').version)
      if (/^(-h|(--)?help)$/.test(cmd)) return usage()
      return dockerCompose(projectName, args)
  }
}
