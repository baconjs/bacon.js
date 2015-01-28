#!/usr/bin/env node

"use strict";

var _ = require("lodash");
var fs = require("fs");
var path = require("path");
var Deps = require("./build-deps")

var argPieceNames =  process.argv.slice(2)
var manifests = argPieceNames.length ? argPieceNames : ["main"];
var defaultOutput = path.join(__dirname, "dist", "Bacon.coffee");

// Boilerplate: *header* and *footer*
var header = fs.readFileSync(path.join(__dirname, "src", "boilerplate",  "object.coffee"), "utf-8");
var footer = fs.readFileSync(path.join(__dirname, "src", "boilerplate",  "exports.coffee"), "utf-8");
// 16 spaces
var padding = "                ";

var main = function(options){
  options = options || {};

  var pieces = Deps.resolvePieces(manifests, "src");
  if (options.verbose) {
    console.info("Linearised dependency graph:")
    _.each(pieces, function (p) {
      if (p.deps.length === 0) {
        console.info(" ", p.name);
      } else {
        console.info(" ", p.name + padding.substr(p.name.length), "←", p.deps.join(", "));
      }
    });
  }

  var output = [
    header,
    _.pluck(pieces, "contents").join("\n"),
    footer,
  ].join("\n");

  if (options.output) {
    try {fs.mkdirSync("dist")} catch (e) {}
    fs.writeFileSync(options.output, output);
  } else {
    console.log(output);
  }
}

if (require.main === module) {
  main({
    verbose:true,
    output: defaultOutput
  });
}

exports.main = main;

