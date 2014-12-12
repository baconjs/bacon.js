(function(root, factory) {
  if (typeof define === "function" && define.amd) {
    // AMD. Register as an anonymous module.
    define(["exports"], function(exports) {
      factory((root.Bacon = exports));
    });
  } else if (typeof exports === "object") {
    // CommonJS
    factory(exports);
  } else {
    // Browser globals
    factory(root);
  }
}(this, function(exports) {
  "use strict";
  var Bacon;
  Bacon = function(exports) {
    var version = "<version>",
      toString = "Bacon";
    exports.version = version;
    exports.toString = toString;
    return exports;
  }({});
  exports.Bacon = Bacon;
}));
