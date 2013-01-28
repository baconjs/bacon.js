module.exports = function (grunt) {

  grunt.initConfig({
    coffee: {
      compile: {
        files: {
          'lib/Bacon.js': 'src/Bacon.coffee'
        }
      }
    },
    uglify: {
      dist: {
        files: {
          'dist/Bacon.min.js': 'lib/Bacon.js'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-coffee');

  grunt.registerTask('build', ['coffee', 'uglify']);
  grunt.registerTask('default', ['build']);
};
