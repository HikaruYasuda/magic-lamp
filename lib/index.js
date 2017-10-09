const fs = require('fs')
const path = require('path')
const spawn = require('child_process').spawn
const createComposeConfig = require('./composeConfig').create
const cwd = process.cwd()

const loadJSONFile = path => fs.existsSync(path) && JSON.parse(fs.readFileSync(path)||'false')
const config = loadJSONFile(path.resolve(cwd, 'package.json')) || {}
const lampConfig = loadJSONFile(path.resolve(cwd, '.lamprc')) || config['lamp'] || {}
const projectName = config['name'] || lampConfig['name'] || path.basename(path.dirname(cwd))
const defaultExecService = lampConfig['service'] || 'web'
const containerName = service => `${projectName}_${service}_1`

exec_command(process.argv.slice(2))

function dockerCompose(args) {
  spawn('docker-compose', ['-p', projectName, ...args], {stdio: 'inherit'})
    .on('exit', code => process.exit(code))
}

function dockerExec(service, args) {
  spawn('docker', ['exec', '-it', containerName(service), ...args], {stdio: 'inherit'})
    .on('exit', code => process.exit(code))
}

function createTemplate(args) {
  const SERVICE_NAMES = ['web', 'db', 'smtp', 'redis']
  const options = {}
  if (args.length) {
    args.filter(v => ~SERVICE_NAMES.indexOf(v)).forEach(v => {
      options[v] = true
    })
  } else {
    SERVICE_NAMES.forEach(v => {
      options[v] = true
    })
  }

  const filename = path.resolve(cwd, 'docker-compose.yml')
  if (fs.existsSync(filename)) {
    console.warn(`${filename} is already exists.`)
    process.exit(2)
  }

  fs.writeFileSync(filename, createComposeConfig(options))
}

function usage() {
  console.log([
    'Usage:  lamp [command[:service]] [args...]',
    'Options:',
    '  service   Service to use for docker exec [default: web]',
    'Commands:',
    '  composer  Run a composer command in a running container',
    '  exec      Execute a command in a running container',
    '  help      Show this help',
    '  login     Login to a running container',
    '  php       Run a php command in a running container',
    '  start     Start containers',
    '  stop      Stop running containers',
    '  test      Run the php unit test in a running container',
    '  template  Output a docker-compose template file for LAMP stack',
    '  ...       Run a docker-compose command'
  ].join('\n'))
}

/** @param {Array} args */
function exec_command(args) {
  const [cmd, service = defaultExecService] = ((arg = '') => arg.split(':'))(args.shift())
  switch (cmd) {
    case 'start': return dockerCompose(['up', '-d', ...args])
    case 'stop': return dockerCompose(['stop', ...args])
    case 'exec': return dockerExec(service, args)
    case 'login': return dockerExec(service, ['bash', ...args])
    case 'composer': return dockerExec(service, ['composer', ...args])
    case 'artisan': return dockerExec(service, ['php', 'artisan', ...args])
    case 'test': return dockerExec(service, ['vendor/bin/phpunit', ...args])
    case 'php': return dockerExec(service, ['php', ...args])
    case 'create': return createTemplate(args)
    case '': return usage()
    default:
      if (/^(-v|(--)?version)$/.test(cmd)) return console.log(require('../package.json').version)
      if (/^(-h|(--)?help)$/.test(cmd)) return usage()
      return dockerCompose(args)
  }
}
