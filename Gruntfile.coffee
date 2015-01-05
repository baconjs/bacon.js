module.exports = (grunt) ->

  # load all the grunt plugins
  require("load-grunt-tasks") grunt

  grunt.initConfig require("load-grunt-configs")(
    grunt
    config:
      src: [
        "tasks/*.coffee"
      ]
  )

  grunt.registerTask "build", ["clean:dist", "copy", "replace:asserts", "coffee", "uglify", "clean:coffee"]
  grunt.registerTask "next", ["6to5"]
  grunt.registerTask "default", ["build","readme"]

  grunt.registerTask "readme", "Generate README.md", ->
    fs = require "fs"
    readmedoc = require "./readme-src.coffee"
    readmegen = require "./readme/readme.coffee"
    fs.writeFileSync("README.md", readmegen readmedoc)
