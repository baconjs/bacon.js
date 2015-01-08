# nodejs modules
fs = require("fs")
to5 = require("6to5")
amdclean = require("amdclean");

module.exports = (grunt, options) =>

  # the main file without .js
  mainFile = "main";
  # Get the script intro and outro strings
  startFrag = fs.readFileSync("src/es6/frags/start.frag","utf8")
  to5Runtime = to5.runtime("polyfill")
  endFrag = fs.readFileSync("src/es6/frags/end.frag","utf8")

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
          prefixMode: "camelCase"
          # wrap the output in a UMD (Universal Module Definition) pattern
          # adding the 6to5 polyfills
          wrap:
            start: startFrag + to5Runtime
            end: endFrag
        )
  # expanded release
  expanded:
    options: grunt.util._.extend({
        out: "dist/Bacon.js"
        optimize: "none"
      }, requirejsOptions)
  # minified release
  min:
    options:
      grunt.util._.extend({
        out: "dist/Bacon.min.js"
        optimize: "uglify2"
      }, requirejsOptions)