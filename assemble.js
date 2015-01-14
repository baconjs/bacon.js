#!/usr/bin/env node
"use strict";

var _ = require("lodash");
var fs = require("fs");
var path = require("path");
var coffee = require("coffee-script");
var to5 = require("6to5");

// Manifest to build
var manifest = "main";
var defaultOutput = path.join(__dirname, "dist", "Bacon.js");

// Boilerplate: *header* and *footer*
var header = fs.readFileSync(path.join(__dirname, "src", "boilerplate",  "object.js"), "utf-8");
var footer = fs.readFileSync(path.join(__dirname, "src", "boilerplate",  "exports.js"), "utf-8");

var pieceCache = {};
var dependenciesRegex = /(?:#|\/\/)\s+build\-dependencies\s*:?\s*([a-zA-Z_, \t]*)/g;

var types = ["coffee", "es6", "js"];

function readPiece(pieceName) {
  if (!pieceCache[pieceName]) {
    var found = false;

    for (var i = 0; i < types.length; i++) {
      var type = types[i];
      var filePath = path.join(__dirname, "src", pieceName + "." + type);
      if (fs.existsSync(filePath)) {
        var contents = fs.readFileSync(filePath, "utf-8");
        found = true;
        break;
      }
    }

    if (!found) {
      throw new Error("Can't find a source for a piece " + pieceName);
    }

    var deps = [];
    var depsRegex = new RegExp(dependenciesRegex);

    var match;
    while (match = depsRegex.exec(contents)) {
      deps = deps.concat(match[1].split(/\s*[, \t]\s*/).map(function (x) { return x.trim(); }))
    }

    var js;
    if (type === "coffee") {
      js = coffee.compile(contents, {
        bare: true, // no function wrapper
      });
    } else if (type === "es6") {
      // Also replace "use strict", there are no way to turn it off
      js = to5.transform(contents).code.replace(/^"use strict";\n\n/, "");
    } else if (type === "js") {
      js = contents;
    } else {
      throw new Error("unsupported type: " + type);
    }

    // Put in cache
    pieceCache[pieceName] = {
      name: pieceName,
      deps: deps,
      contents: contents,
      js: js,
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
    _.pluck(pieces, "js").join("\n"),
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

