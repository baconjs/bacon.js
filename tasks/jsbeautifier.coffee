# Make it tasty!
module.exports = (grunt, options) =>
  dist:
    src: 'dist/Bacon.es6.js'
    options:
      js: grunt.file.readJSON('.jsbeautifyrc')