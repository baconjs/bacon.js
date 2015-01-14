(function() {
"use strict";

var Bacon, Exception;

Bacon = {
  toString: function() {
    return "Bacon";
  }
};

Bacon.version = '<version>';

Exception = (typeof global !== "undefined" && global !== null ? global : this).Error;
