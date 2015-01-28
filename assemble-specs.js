#!/usr/bin/env node

"use strict";

var _ = require("lodash");
var fs = require("fs");
var path = require("path");
var shell = require('shelljs');

// Manifest to build
var defaultOutput = path.join(__dirname, "spec", "BaconSpec.coffee");

// Boilerplate: *header* and *footer*
var header = fs.readFileSync(path.join(__dirname, "spec", "boilerplate", "SpecHeader.coffee"), "utf-8");

function resolvePieceNames() {
  var argPieceNames =  process.argv.slice(2)
  if (argPieceNames.length) return argPieceNames
  return fs.readdirSync("spec/specs")
    .map(function(name) { return name.substring(0, name.length - 7)})
}

function readPiece(pieceName) {
  return fs.readFileSync(path.join(__dirname, "spec", "specs", pieceName + ".coffee"), "utf-8");
}

var main = function(options){
  var pieceNames = (options.pieceNames || resolvePieceNames())
  var pieces = pieceNames.map(readPiece)
  var output = [
    header,
    pieces.join("\n"),
  ].join("\n");

  var buildArgs = pieces.length > 3 ? "" : pieceNames.join(" ")

  console.log("Building lib with args: " + buildArgs)

  var result = shell.exec("./build " + buildArgs)
  if (result.code != 0)
    process.exit(result.code)

  if (options.output) {
    try {fs.mkdirSync("dist")} catch (e) {}
    fs.writeFileSync(options.output, output);
  } else {
    console.log(output);
  }
}

if (require.main === module) {
  main({
    verbose: true,
    output: defaultOutput,
  });
}

exports.main = main;
