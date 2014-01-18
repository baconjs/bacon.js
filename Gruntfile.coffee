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


  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-contrib-copy'
  grunt.loadNpmTasks 'grunt-contrib-uglify'

  grunt.registerTask 'build', ['clean:dist', 'copy', 'removeAsserts', 'coffee', 'uglify', 'clean:coffee']
  grunt.registerTask 'default', ['build']

  grunt.registerTask 'removeAsserts', ->
    fs = require 'fs'
    file = fs.readFileSync('dist/Bacon.coffee', 'utf8')
    replacedData = file.replace(/assert.*/g, '')
    fs.writeFileSync('dist/Bacon.noAssert.coffee', replacedData);

  grunt.registerTask 'readme', 'Generate README.md', ->
    fs = require 'fs'
    readmedoc = require './readme.coffee'
    readmegen = require './readme/readme.coffee'
    fs.writeFileSync('README.md', readmegen readmedoc)
