# nodejs modules
fs = require("fs")
amdclean = require("amdclean");

module.exports = (grunt, options) =>

  # the main file without .js
  mainFile = "Bacon";
  # Get the script intro and outro strings
  startFrag = fs.readFileSync("src/frags/start.frag","utf8")
  endFrag = fs.readFileSync("src/frags/end.frag","utf8")

  # common build options
  # they will be exrended below
  requirejsOptions =
    baseUrl: "tmp"
    name: mainFile
    useStrict: true
    wrap: false
    # mainConfigFile: "src/requirejs-config.js"
    preserveLicenseComments: false
    findNestedDependencies: true
    onModuleBundleComplete: (data) ->
      outputFile = data.path
      # use the amdclean to remove all the require functions
      # check the options https://github.com/gfranko/amdclean
      fs.writeFileSync outputFile, amdclean.clean(
          code: fs.readFileSync(outputFile)
          escodegen:
            format:
              quotes: "double"
          #aggressiveOptimizations: false
          removeUseStricts: false
          # wrap the output in a UMD (Universal Module Definition) pattern
          wrap:
            start: startFrag
            end: endFrag
        )
  # expanded release
  expanded:
    options: grunt.util._.extend({
        out: "dist/Bacon.es6.js"
        optimize: "none"
      }, requirejsOptions)
  # minified release
  min:
    options:
      grunt.util._.extend({
        out: "dist/Bacon.es6.min.js"
        optimize: "uglify2"
      }, requirejsOptions)