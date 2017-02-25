var _ = require("lodash");
var fs = require("fs");
var path = require("path");
var assert = require("assert");

var dependenciesRegex = /(?:#|\/\/)\s+build\-dependencies\s*:?\s*([a-zA-Z_, \t]*)/g;

function readDeps(contents) {
    var deps = [];
    var depsRegex = new RegExp(dependenciesRegex);
    var match;
    while (match = depsRegex.exec(contents)) {
      deps = deps.concat(match[1].split(/\s*[, \t]\s*/).map(function (x) { 
        return x.trim().toLowerCase()
      }))
    }
    return deps
}


function readPiece(pieceName, dir, pieceCache) {
  if (!pieceCache[pieceName]) {
    var jsPath = path.join(dir, pieceName + ".js");
    var coffeePath = path.join(dir, pieceName + ".coffee");

    var type = fs.existsSync(jsPath) ? "js" : "coffee";
    var filepath = type === "js" ? jsPath : coffeePath;
    var contents = fs.readFileSync(filepath, "utf-8");

    // Put in cache
    pieceCache[pieceName] = {
      name: pieceName,
      deps: readDeps(contents),
      contents: contents,
      type: type,
    };
  }

  return pieceCache[pieceName];
}

function resolve(pieceNames, dir, resolving, pieceCache, options) {
  resolving = resolving || [];

  return _.uniq(_.flatten(pieceNames.map(function(pieceName) {
    var piece = readPiece(pieceName, dir, pieceCache);

    if (_.includes(resolving, pieceName)) {
      throw new Error("circular dependency resolving " + piece + "; stack: " + resolving.join(""));
    }

    var deps = _.chain(piece.deps)
      .map(function (x) { 
        if (options.recursive)
          return resolve([x], dir, resolving.concat([pieceName]), pieceCache, options) 
        else
          return readPiece(x, dir, pieceCache)
      })
      .flatten()
      .value();
    
    return deps.concat([piece]);
  })))
}

module.exports.resolvePieces = function(pieceNames, dir, options) {
  if (!options) options = { recursive: true };
  return resolve(pieceNames, dir, [], {}, options);
}

var isCoffeePiece = (piece) => piece.type === "coffee";
var isJsPiece = (piece) => piece.type === "js";

module.exports.splitPieces = function (pieces) {
  var coffeePieces = _.chain(pieces).takeWhile(isCoffeePiece).value();
  var jsPieces = _.chain(pieces).dropWhile(isCoffeePiece).takeWhile(isJsPiece).value();
  var restPieces = _.chain(pieces).dropWhile(isCoffeePiece).dropWhile(isJsPiece).value();

  assert(restPieces.length === 0, "There shouldn't be coffee pieces after js ones.");

  return [coffeePieces, jsPieces];
};
