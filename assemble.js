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

var peaceCache = {};
var dependenciesRegex = /#\s+build\-dependencies\s*:?\s*([a-zA-Z_, \t]*)/;

function readPiece(peaceName) {
  if (!peaceCache[peaceName]) {
    var contents = fs.readFileSync(path.join(__dirname, "src", peaceName + ".coffee"), "utf-8");
    var deps = contents.match(dependenciesRegex);

    if (deps) {
      // split list by whitespace or comma
      deps = deps[1].split(/\s*[, \t]\s*/).map(function (x) { return x.trim(); });
    } else {
      // no match, no deps
      deps = [];
    }    

    // Put in cache
    peaceCache[peaceName] = {
      name: peaceName,
      deps: deps,
      contents: contents,
    };
  }

  return peaceCache[peaceName];
}

function resolve(peaceName, resolving) {
  resolving = resolving || [];

  if (_.contains(resolving, peaceName)) {
    throw new Error("circular dependency resolving " + peace + "; stack: " + resolving.join(""));
  }

  // read peace
  var piece = readPiece(peaceName);

  // recursively resolve dependencies
  var recResolving = [peaceName].concat(recResolving)
  var deps = _.chain(piece.deps)
    .map(function (x) { return resolve(x, recResolving); })
    .flatten()
    .value();

  return deps.concat([piece]);
}

var main = function(options){
  options = options || {};

  var pieces = resolve(manifest);
  if (options.verbose) {
    console.info("Linearised dependency graph:")
    _.each(pieces, function (p) {
      if (p.deps.length === 0) {
        console.info(" ", p.name);
      } else {
        console.info(" ", p.name, "←", p.deps.join(", "));
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

