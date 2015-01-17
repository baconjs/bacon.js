module.exports = (grunt) ->
  grunt.initConfig
    clean:
      dist: ['dist/']

    uglify:
      dist:
        files:
          'dist/Bacon.min.js': 'dist/Bacon.noAssert.js'

    # TODO: Can be done with falafel on JavaScript source
    replace:
      asserts:
        dest: 'dist/Bacon.noAssert.js'
        src: ['dist/Bacon.js']
        replacements: [
          from: /assert[a-zA-Z]*\(.*/g
          to: ''
        ]

    watch:
      coffee:
        files: 'src/*.coffee'
        tasks: 'build'
      readme:
        files: 'readme-src.coffee'
        tasks: 'readme'

  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-contrib-copy'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-text-replace'
  grunt.loadNpmTasks 'grunt-coffeelint'

  grunt.registerTask 'build', ['clean:dist', 'assemble', 'replace:asserts', 'uglify']
  grunt.registerTask 'default', ['build','readme']

  grunt.registerTask 'readme', 'Generate README.md', ->
    fs = require 'fs'
    readmedoc = require './readme-src.coffee'
    readmegen = require './readme/readme.coffee'
    fs.writeFileSync('README.md', readmegen readmedoc)

  grunt.registerTask 'assemble', 'Generate bacon.coffee', ->
    require('./assemble.js').main
      output: 'dist/Bacon.js'
