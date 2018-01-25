#!/usr/bin/env babel-node

/**
 * This file is responsible for building Bacon.js, Bacon.noAssert.js and Bacon.min.js
 */

/* eslint no-console: 0 */
"use strict";

var fs = require("fs");
var path = require("path");
var rollup = require("rollup").rollup;
var babelPlugin = require("rollup-plugin-babel");

var recast = require("recast");
var uglifyjs = require("uglify-js");
var esprima = require("esprima");
var estraverse = require("estraverse");
var escodegen = require("escodegen");
var jsstana = require("jsstana");

var argPieceNames = process.argv.slice(2);
var defaultOutput = path.join(__dirname, "..", "dist", "Bacon.js");
var defaultNoAssert = path.join(__dirname, "..", "dist", "Bacon.noAssert.js");
var defaultMinified = path.join(__dirname, "..", "dist", "Bacon.min.js");

var customBuildPlugin = function(options) {
  var pieces = (options || {}).pieces || [];
  var filter = function(id) {
    return path.basename(id) === 'bacon.js';
  }

  return {
    transform (code, id) {
      if (!filter(id)) return;

      var ast = recast.parse(code, { sourceFileName: id });
      recast.visit(ast, {
        visitImportDeclaration: function(path) {
          this.traverse(path);
          var name = path.node.source.value.replace(/^.\//, '');
          if (name !== 'core' && pieces.indexOf(name) === -1) {
            path.replace(null);
          }

        }
      });

      return recast.print(ast, { sourceMapName: "map.json" });
    }
  };
}

var main = function(options) {
  options = options || {};

  function notAssertStatement(node) {
    if (node.type == "FunctionDeclaration" && node.id.name.match(/^assert/)) {
      return false;
    }

    var m1 = jsstana.match("(expr (call (ident ?fn) ??))", node);
    if (m1 && m1.fn.match(/^assert/)) {
      return false;
    }
    var m2 = jsstana.match("(expr (assign = (ident ?fn) ?))", node);
    if (m2 && m2.fn.match(/^assert/)) {
      return false;
    }

    return true;
  }

  function stripAsserts(code) {
    var ast = esprima.parse(code, { sourceType: 'module' });
    estraverse.replace(ast, {
      enter: function (node) {
        if (node !== null && node.type === "BlockStatement") {
          node.body = node.body.filter(notAssertStatement);
          return node;
        }
      }
    })
    return escodegen.generate(ast);
  }

  try {fs.mkdirSync("dist")} catch (e) {
    // directory exists, do nothing
  }

  var plugins = [babelPlugin()];
  if (process.argv.length > 2) {
    plugins.push(customBuildPlugin({ pieces: argPieceNames }));
  }

  rollup({
    input: 'src/bacon.js',
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
    var output = fs.readFileSync('dist/Bacon.js');
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
