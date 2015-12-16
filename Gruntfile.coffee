browserstack = (grunt) ->
  log = (message) -> grunt.log.write(message)

  exec = require('child_process').exec
  ->
    new Promise (resolve, reject) ->
      child = exec './node_modules/.bin/browserstack-runner', (error, stdout, stderr) ->
        if error
          reject(error)
        else
          resolve(stdout.toString())
      child.stdout.on('data', log)
      child.stderr.on('data', log)

setCommitStatus = (sha, state) ->
  GitHub = require('github')
  github = new GitHub
    version: '3.0.0'
    protocol: 'https',
    timeout: 5000,
    headers:
      'user-agent': 'github-status-reporter'

  github.authenticate
    type: 'oauth'
    token: process.env.GITHUB_TOKEN

  q =
    user: 'lautis',
    repo: 'bacon.js',
    sha: sha,
    state: state
    context: 'continous-integration/browserstack'

  new Promise (resolve, reject) ->
    github.statuses.create q, (error) ->
      if error
        reject(error)
      else
        resolve()

module.exports = (grunt) ->
  grunt.initConfig
    clean:
      dist: ['dist/']

    coffeelint:
      bacon: [ 'src/*.coffee' ]
      options:
        configFile: 'coffeelint.json'

    eslint:
      bacon: [ 'src/*.js' ]
      options:
        configFile: '.eslintrc'
    shell:
      build:
        command: './build'
    watch:
      coffee:
        files: [ 'src/*.coffee' ]
        tasks: [ 'coffeelint', 'build' ]
      js:
        files: [ 'src/*.js' ]
        tasls: [ 'eslint', 'build' ]
      readme:
        files: 'readme-src.coffee'
        tasks: 'readme'

  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-coffeelint'
  grunt.loadNpmTasks 'grunt-eslint'
  grunt.loadNpmTasks 'grunt-shell'

  grunt.registerTask 'build', ['shell:build']

  grunt.registerTask 'default', ['coffeelint', 'eslint', 'build', 'readme']

  grunt.registerTask 'readme', 'Generate README.md', ->
    fs = require 'fs'
    readmedoc = require './readme-src.coffee'
    readmegen = require './readme/readme.coffee'
    fs.writeFileSync('README.md', readmegen readmedoc)

  grunt.registerTask 'browserstack-status', 'Run BrowserStack tests and report status to GitHub', ->
    done = @async()
    git = require('git-rev')
    git.long (sha) ->
      grunt.log.write('SHA: ' + sha)
      setCommitStatus(sha, 'pending')
        .then(browserstack(grunt))
        .then(
          (output) -> setCommitStatus(sha, 'success')
          (error) -> setCommitStatus(sha, 'failure').then(-> Promise.reject(error))
        ).then(done, ->
          grunt.log.error(error.message)
          done(1)
        )
