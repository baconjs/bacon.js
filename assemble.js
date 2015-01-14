#!/usr/bin/env node


"use strict";

var _ = require("lodash");
var fs = require("fs");
var path = require("path");

// Manifest to build
var manifest = "main";
var defaultOutput = path.join(__dirname, "dist", "Bacon.coffee");

// Boilerplate: *header* and *footer*
var header = fs.readFileSync(path.join(__dirname, "src", "boilerplate",  "object.coffee"), "utf-8");
var footer = fs.readFileSync(path.join(__dirname, "src", "boilerplate",  "exports.coffee"), "utf-8");

var pieceCache = {};
var dependenciesRegex = /#\s+build\-dependencies\s*:?\s*([a-zA-Z_, \t]*)/g;

function readPiece(pieceName) {
  if (!pieceCache[pieceName]) {
    var contents = fs.readFileSync(path.join(__dirname, "src", pieceName + ".coffee"), "utf-8");
    var deps = [];

    var depsRegex = new RegExp(dependenciesRegex);

    var match;
    while (match = depsRegex.exec(contents)) {
      deps = deps.concat(match[1].split(/\s*[, \t]\s*/).map(function (x) { return x.trim(); }))
    }

    // Put in cache
    pieceCache[pieceName] = {
      name: pieceName,
      deps: deps,
      contents: contents,
    };
  }

  return pieceCache[pieceName];
}

function resolve(pieceName, resolving) {
  resolving = resolving || [];

  if (_.contains(resolving, pieceName)) {
    throw new Error("circular dependency resolving " + piece + "; stack: " + resolving.join(""));
  }

  // read piece
  var piece = readPiece(pieceName);

  // recursively resolve dependencies
  var recResolving = [pieceName].concat(recResolving)
  var deps = _.chain(piece.deps)
    .map(function (x) { return resolve(x, recResolving); })
    .flatten()
    .value();

  return _.uniq(deps.concat([piece]));
}

// 16 spaces
var padding = "                ";

var main = function(options){
  options = options || {};

  var pieces = resolve(manifest);
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
    verbose: true,
    output: defaultOutput,
  });
}

exports.main = main;

