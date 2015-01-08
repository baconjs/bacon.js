(function(root, factory) {
    if (typeof define === "function" && define.amd) {
      // AMD. Register as an anonymous module.
      define(["exports"], function(exports) {
        factory((root.Bacon = exports), root);
      });
    } else if (typeof exports === "object") {
      // CommonJS
      factory(exports, global);
    } else {
      // Browser globals
      factory(root, root);
    }
  }(this, function(exports, global) {
      "use strict";