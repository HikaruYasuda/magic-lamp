const fs = require('fs')
const path = require('path')
const spawn = require('child_process').spawn
const createComposeConfig = require('./composeConfig').create

module.exports = {
  dockerCompose,
  dockerExec,
  createTemplate,
  createComposeConfig,
}

function dockerCompose(projectName, args) {
  spawn('docker-compose', ['-p', projectName, ...args], {stdio: 'inherit'})
    .on('exit', code => process.exit(code))
}

function dockerExec(container, args) {
  spawn('docker', ['exec', '-it', container, ...args], {stdio: 'inherit'})
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

  const filename = 'docker-compose.yml'
  if (fs.existsSync(filename)) {
    console.warn(`${filename} is already exists.`)
    process.exit(2)
  }

  fs.writeFileSync(filename, createComposeConfig(options))
}
