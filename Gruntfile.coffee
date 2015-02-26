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
