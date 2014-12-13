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
  var helpersHasProp, helpersIsArray, helpersIsFunction, helpersToString, helpersMap, helpersHelpers, Bacon;
  helpersHasProp = function(exports) {
    exports["default"] = Object.prototype.hasOwnProperty;
    return exports;
  }({});
  helpersIsArray = function(exports) {
    function isArray(xs) {
      return xs instanceof Array;
    }
    exports["default"] = isArray;
    return exports;
  }({});
  helpersIsFunction = function(exports) {
    function isFunction(f) {
      return typeof f === "function";
    }
    exports["default"] = isFunction;
    return exports;
  }({});
  helpersToString = function(exports, _hasProp, _isArray, _isFunction) {
    var hasProp = _hasProp["default"];
    var isArray = _isArray["default"];
    var isFunction = _isFunction["default"];
    var recursionDepth = 0;

    function toString(obj) {
      var ex, internals, key, value;
      try {
        recursionDepth++;
        if (!obj) {
          return "undefined";
        } else if (isFunction(obj)) {
          return "function";
        } else if (isArray(obj)) {
          if (recursionDepth > 5) {
            return "[..]";
          }
          return "[" + _.map(_.toString, obj).toString() + "]";
        } else if ((obj != null ? obj.toString : void 0) != null && obj.toString !== Object.prototype.toString) {
          return obj.toString();
        } else if (typeof obj === "object") {
          if (recursionDepth > 5) {
            return "{..}";
          }
          internals = function() {
            var _results;
            _results = [];
            for (key in obj) {
              if (!hasProp.call(obj, key))
                continue;
              value = function() {
                try {
                  return obj[key];
                } catch (_error) {
                  ex = _error;
                  return ex;
                }
              }();
              _results.push(toString(key) + ":" + toString(value));
            }
            return _results;
          }();
          return "{" + internals + "}";
        } else {
          return obj;
        }
      } finally {
        recursionDepth--;
      }
    }
    exports["default"] = toString;
    return exports;
  }({}, helpersHasProp, helpersIsArray, helpersIsFunction);
  helpersMap = function(exports) {
    function map(f, xs) {
      var x, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = xs.length; _i < _len; _i++) {
        x = xs[_i];
        _results.push(f(x));
      }
      return _results;
    }
    exports["default"] = map;
    return exports;
  }({});
  helpersHelpers = function(exports, _toString, _map) {
    var toString = _toString["default"];
    var map = _map["default"];
    exports.map = map;
    exports.toString = toString;
    return exports;
  }({}, helpersToString, helpersMap);
  Bacon = function(exports, _helpersHelpers) {
    var _ = _helpersHelpers;
    var version = "<version>",
      toString = "Bacon";
    exports.version = version;
    exports.toString = toString;
    exports._ = _;
    return exports;
  }({}, helpersHelpers);
  exports.Bacon = Bacon;
}));
