/* eslint no-console: 0 */
"use strict";

var fs = require("fs");
var path = require("path");
var rollup = require("rollup").rollup;
var typescriptPlugin = require("rollup-plugin-typescript2");

var uglifyjs = require("uglify-js");
var stripAsserts = require("./assemble/stripAsserts")

var argPieceNames = process.argv.slice(2);
var defaultOutput = path.join(__dirname, "..", "dist", "Bacon.js");
var defaultNoAssert = path.join(__dirname, "..", "dist", "Bacon.noAssert.js");
var defaultMinified = path.join(__dirname, "..", "dist", "Bacon.min.js");

function main(options) {
  options = options || {};

  try {fs.mkdirSync("dist")} catch (e) {
    // directory exists, do nothing
  }

  var plugins = [
    typescriptPlugin({
      typescript: require("typescript"),
      useTsconfigDeclarationDir: true
    })
  ];

  rollup({
    input: 'src/bacon.ts',
    plugins: plugins
  }).then((bundle) => {
    return bundle.write({
      format: 'umd',
      name: 'Bacon',
      globals: {
        jQuery: 'jQuery',
        Bacon: 'Bacon',
        Zepto: 'Zepto'
      },
      file: 'dist/Bacon.js',
      indent: false
    });
  }).then(function() {
    var output = fs.readFileSync('dist/Bacon.js', 'utf-8');
    var noAssertOutput = stripAsserts(output);
    if (options.noAssert) {
      fs.writeFileSync(options.noAssert, noAssertOutput);
    }

    // Minifying
    var minifiedOutput = uglifyjs.minify(noAssertOutput, {
      fromString: true
    }).code;

    if (options.minified) {
      fs.writeFileSync(options.minified, minifiedOutput);
    }
  }).catch(function(error) {
    console.error(error);
    process.exit(1);
  });
}

if (require.main === module) {
  main({
    verbose: true,
    output: defaultOutput,
    noAssert: defaultNoAssert,
    minified: defaultMinified
  });
}

exports.main = main;
