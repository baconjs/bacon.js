"use strict";

var esprima = require("esprima");
var estraverse = require("estraverse");
var escodegen = require("escodegen");
var jsstana = require("jsstana");


function stripAsserts(code) {
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

module.exports = stripAsserts