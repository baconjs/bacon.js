module.exports = (grunt) ->
  grunt.initConfig
    clean:
      dist: ['dist/']
      coffee: ['dist/*.coffee']

    coffee:
      compile:
        expand: true
        files: [
          'dist/Bacon.js': 'dist/Bacon.coffee'
          'dist/Bacon.min.js': 'dist/Bacon.noAssert.coffee'
        ]

    coffeelint:
      bacon: [ 'src/Bacon.coffee' ]
      options:
        max_line_length:
          level: 'ignore'

    uglify:
      dist:
        files:
          'dist/Bacon.min.js': 'dist/Bacon.min.js'

    copy:
      dist:
        expand:true
        files:[
          'dist/Bacon.coffee': 'src/Bacon.coffee'
        ]


    replace:
      asserts:
        dest: 'dist/Bacon.noAssert.coffee'
        src: ['dist/Bacon.coffee']
        replacements: [
          from: /assert.*/g
          to: ''
        ]
    watch:
      coffee:
        files: 'src/*.coffee'
        tasks: 'build'


  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-contrib-copy'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-text-replace'
  grunt.loadNpmTasks 'grunt-coffeelint';

  grunt.registerTask 'build', ['clean:dist', 'copy', 'replace:asserts', 'coffee', 'uglify', 'clean:coffee']
  grunt.registerTask 'default', ['build']

  grunt.registerTask 'readme', 'Generate README.md', ->
    fs = require 'fs'
    readmedoc = require './readme-src.coffee'
    readmegen = require './readme/readme.coffee'
    fs.writeFileSync('README.md', readmegen readmedoc)
