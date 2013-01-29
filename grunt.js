module.exports = function (grunt) {
  grunt.initConfig({
    clean: {
      dist: ['dist/'],
      coffee: ['dist/*.coffee']
    },
    coffee: {
      compile: {
        files: [
          {
            'dist/Bacon.js': 'dist/Bacon.coffee',
            'dist/Bacon.min.js': 'dist/Bacon.noAssert.coffee'
          }
        ]
      }
    },
    min: {
      dist: {
        src: 'dist/Bacon.min.js',
        dest: 'dist/Bacon.min.js'
      }
    },
    copy: {
      dist: {
        files: [
          {
            src: ['src/Bacon.coffee'],
            dest: 'dist/'
          }
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('build', ['clean:dist', 'copy', 'removeAsserts', 'coffee', 'min', 'clean:coffee']);
  grunt.registerTask('default', ['build']);

  grunt.registerTask('removeAsserts', function () {
    fs = require('fs');
    file = fs.readFileSync('dist/Bacon.coffee', 'utf8');
    replacedData = file.replace(/assert.*/g, '');
    fs.writeFileSync('dist/Bacon.noAssert.coffee', replacedData);
  })

};