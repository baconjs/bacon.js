import hasProp from "./hasProp";
import isArray from "./isArray";
import isFunction from "./isFunction";

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
    } else if (((obj != null ? obj.toString : void 0) != null) && obj.toString !== Object.prototype.toString) {
      return obj.toString();
    } else if (typeof obj === "object") {
      if (recursionDepth > 5) {
        return "{..}";
      }
      internals = (function() {
        var _results;
        _results = [];
        for (key in obj) {
          if (!hasProp.call(obj, key)) continue;
          value = (function() {
            try {
              return obj[key];
            } catch (_error) {
              ex = _error;
              return ex;
            }
          })();
          _results.push(toString(key) + ":" + toString(value));
        }
        return _results;
      })();
      return "{" + internals + "}";
    } else {
      return obj;
    }
  } finally {
    recursionDepth--;
  }
}

export default toString;