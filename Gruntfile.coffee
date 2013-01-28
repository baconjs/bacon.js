module.exports = (grunt) ->
  grunt.initConfig
    clean:
      dist: ['dist']

    coffee:
      compile:
        files:
          'lib/Bacon.js': 'src/Bacon.coffee'
    uglify:
      dist:
        files:
          'dist/Bacon.min.js': 'lib/Bacon.js'

  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-clean'

  grunt.registerTask 'build', ['clean', 'coffee', 'uglify']
  grunt.registerTask 'default', ['build']
