#!/usr/bin/env babel-node

"use strict";

var _ = require("lodash");
var fs = require("fs");
var path = require("path");
var shell = require('shelljs');
var Deps = require('./build-deps')

// Manifest to build
var defaultOutput = path.join(__dirname, "spec", "BaconSpec.coffee");

// Boilerplate: *header* and *footer*
var header = fs.readFileSync(path.join(__dirname, "spec", "boilerplate", "SpecHeader.coffee"), "utf-8");
var helper = fs.readFileSync(path.join(__dirname, "spec", "boilerplate", "SpecHelper.coffee"), "utf-8");

function resolvePieceNames() {
  var argPieceNames =  process.argv.slice(2)
  if (argPieceNames.length) return argPieceNames
  return fs.readdirSync("spec/specs")
    .map(function(name) { return name.substring(0, name.length - 7)})
}

function readPiece(pieceName) {
  return fs.readFileSync(path.join(__dirname, "spec", "specs", pieceName + ".coffee"), "utf-8");
}

function buildArgs(pieceNames) {
  if (pieceNames.length > 3) return ""
  var pieceNames = Deps.resolvePieces(pieceNames, "spec/specs", { recursive: false })
    .map(function(piece) { return piece.name })
  return pieceNames.join(" ")
}

var main = function(options){
  var pieceNames = (options.pieceNames || resolvePieceNames())
  var pieces = pieceNames.map(readPiece)
  var output = [
    header,
    helper,
    pieces.join("\n"),
  ].join("\n");


  console.log("Building lib with args: " + buildArgs(pieceNames))

  var result = shell.exec("./build " + buildArgs(pieceNames))
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
