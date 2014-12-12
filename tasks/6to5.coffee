to5 = require("6to5")

module.exports = (grunt) ->
  # Avoiding the use of the plugin grunt plugin to use always the latest 6to5 version
  # register the task https://github.com/6to5/grunt-6to5
  grunt.registerMultiTask "6to5", "Transpile ES6 to ES5", ->
    options = @options()
    @files.forEach (el) ->
      options.filename = el.src[0]
      options.filenameRelative = el.src[0].replace("src/","")
      res = to5.transformFileSync(el.src[0], options)
      grunt.file.write el.dest, res.code
      grunt.file.write el.dest + ".map", JSON.stringify(res.map)  if res.map

  options:
    blacklist: ["useStrict"]
    modules: "amd"
    amdModuleIds: true
  compile:
    files:[
      expand: true
      cwd: "src"
      src: "**/*.js"
      dest: "tmp"
    ]

