#!/usr/bin/env babel-node

/**
 * This file is responsible for building Bacon.js, Bacon.noAssert.js and Bacon.min.js
 */

"use strict";

var _ = require("lodash");
var fs = require("fs");
var path = require("path");
var Deps = require("./build-deps");
var babel = require("babel");
var assert = require("assert");
var uglifyjs = require("uglify-js");
var esprima = require("esprima");
var estraverse = require("estraverse");
var escodegen = require("escodegen");
var jsstana = require("jsstana");

var argPieceNames =  process.argv.slice(2)
var manifests = argPieceNames.length ? argPieceNames : ["main"];
var defaultOutput = path.join(__dirname, "dist", "Bacon.js");
var defaultNoAssert = path.join(__dirname, "dist", "Bacon.noAssert.js");
var defaultMinified = path.join(__dirname, "dist", "Bacon.min.js");

// Boilerplate: *header* and *footer*
var header = fs.readFileSync(path.join(__dirname, "src", "boilerplate",  "object.js"), "utf-8");
var footer = fs.readFileSync(path.join(__dirname, "src", "boilerplate",  "exports.js"), "utf-8");
// 16 spaces
var padding = "                ";

var main = function(options){
  options = options || {};

  var pieces = Deps.resolvePieces(manifests, "src");

  if (options.verbose) {
    console.info("Linearised dependency graph:")
    _.each(pieces, function (p) {
      var name = p.name + (p.type === "js" ? "*" : "");
      if (p.deps.length === 0) {
        console.info(" ", name);
      } else {
        console.info(" ", name + padding.substr(name.length), "←", p.deps.join(", "));
      }
    });
  }

  // let's be conservative with Babel options:
  var babelOptions = {
    comments: false,
    whitelist: [
      "es3.memberExpressionLiterals",
      "es3.propertyLiterals",
      "es6.arrowFunctions",
      "es6.blockScoping",
      "es6.properties.shorthand",
      "es6.constants",
      "es6.destructuring",
      "es6.parameters",
      "es6.spread"
    ],
    loose: [
      "es6.spread",
      "es6.destructuring"
    ]
  };

  var esOutput = header + _.map(pieces, "contents").join("\n") + footer;
  var esTranspiled = babel.transform(esOutput, babelOptions);
  var output = "(function() {\n" + esTranspiled.code + "\n}).call(this);";

  // Stripping asserts
  function notAssertStatement(node) {
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
    var ast = esprima.parse(code);
    estraverse.replace(ast, {
      enter: function (node, parent) {
        if (node !== null && node.type === "BlockStatement") {
          node.body = node.body.filter(notAssertStatement);
          return node;
        }
      }
    })
    return escodegen.generate(ast);
  }
  var noAssertOutput = stripAsserts(output);

  // Minifying
  var minifiedOutput = uglifyjs.minify(noAssertOutput, {
    fromString: true,
  }).code;

  if (options.output) {
    try {fs.mkdirSync("dist")} catch (e) {}
    fs.writeFileSync(options.output, output);

    if (options.noAssert) {
      fs.writeFileSync(options.noAssert, noAssertOutput);
    }

    if (options.minified) {
      fs.writeFileSync(options.minified, minifiedOutput);
    }
  } else {
    console.log(output);
  }
}

if (require.main === module) {
  main({
    verbose: true,
    output: defaultOutput,
    noAssert: defaultNoAssert,
    minified: defaultMinified,
  });
}

exports.main = main;
