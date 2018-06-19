"use strict";

var recast = require("recast");
var path = require("path");

function partialBuildPlugin(options) {
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
module.exports = partialBuildPlugin