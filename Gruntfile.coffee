module.exports = (grunt) ->
  grunt.initConfig
    clean:
      dist: ['dist/']
      # coffee: ['dist/*.coffee']
      ls: ['dist/*.ls']

    livescript:
      compile:
        expand: true
        files: [
          'dist/Bacon.js': 'dist/Bacon.ls'
          'dist/Bacon.min.js': 'dist/Bacon.noAssert.ls'
        ]

    # coffee:
    #   compile:
    #     expand: true
    #     files: [
    #       'dist/Bacon.js': 'dist/Bacon.coffee'
    #       'dist/Bacon.min.js': 'dist/Bacon.noAssert.coffee'
    #     ]

    uglify:
      dist:
        files: 
          'dist/Bacon.min.js': 'dist/Bacon.min.js'

    copy: 
      dist: 
        expand:true
        files:[
          'dist/Bacon.ls': 'src/Bacon.ls'
        ]
        
    
  # grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-livescript'
  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-contrib-copy'
  grunt.loadNpmTasks 'grunt-contrib-uglify'

  # grunt.registerTask 'build', ['clean:dist', 'copy', 'removeAsserts', 'livescript', 'coffee', 'uglify', 'clean:coffee']
  grunt.registerTask 'build', ['clean:dist', 'copy', 'removeAsserts', 'livescript', 'uglify', 'clean:ls']
  grunt.registerTask 'default', ['build']

  grunt.registerTask 'removeAsserts', ->
    fs = require 'fs'
    file = fs.readFileSync('dist/Bacon.ls', 'utf8')
    replacedData = file.replace(/assert.*/g, '')
    fs.writeFileSync('dist/Bacon.noAssert.ls', replacedData);