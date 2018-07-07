import { isArray } from './helpers';
import { None } from './optional';

var _ = {
  indexOf: (() => {
    if (Array.prototype.indexOf) {
      return (function(xs, x) { return xs.indexOf(x); });
    } else {
      return (function(xs, x) {
        for (var i = 0, y; i < xs.length; i++) {
          y = xs[i];
          if (x === y) { return i; }
        }
        return -1;
      });
    }
  })(),
  indexWhere(xs, f) {
    for (var i = 0, y; i < xs.length; i++) {
      y = xs[i];
      if (f(y)) { return i; }
    }
    return -1;
  },
  flip<A, B, C>(f: (A, B) => C): ((B, A) => C) {
    return (a, b) => f(b, a)
  },
  head<V>(xs: V[]): V { return xs[0]; },
  always(x) { return () => x; },
  negate(f) { return function(x) { return !f(x); }; },
  empty(xs) { return xs.length === 0; },
  tail<V>(xs: V[]): V[] { return xs.slice(1, xs.length); },
  filter<A>(f: (A) => boolean, xs: A[]): A[] {
    var filtered: A[] = [];
    for (var i = 0, x; i < xs.length; i++) {
      x = xs[i];
      if (f(x)) { filtered.push(x); }
    }
    return filtered;
  },
  map<A, B>(f: (A) => B, xs: A[]): B[] {
    var result: B[] = [];
    for (var i = 0, x; i < xs.length; i++) {
      x = xs[i];
      result.push(f(x));
    }
    return result;
  },
  each(xs, f) {
    for (var key in xs) {
      if (Object.prototype.hasOwnProperty.call(xs, key)) {
        var value = xs[key];
        f(key, value);
      }
    }
  },
  toArray(xs) { return isArray(xs) ? xs : [xs]; },
  contains(xs, x) { return _.indexOf(xs, x) !== -1; },
  id<A>(x): A { return x; },
  last(xs) { return xs[xs.length - 1]; },
  all<A>(xs: A[], f: (A) => boolean = _.id): boolean {
    for (var i = 0, x; i < xs.length; i++) {
      x = xs[i];
      if (!f(x)) { return false; }
    }
    return true;
  },
  any(xs, f = _.id) {
    for (var i = 0, x; i < xs.length; i++) {
      x = xs[i];
      if (f(x)) { return true; }
    }
    return false;
  },
  without(x, xs) {
    return _.filter((function(y) { return y !== x; }), xs);
  },
  remove(x, xs) {
    var i = _.indexOf(xs, x);
    if (i >= 0) {
      return xs.splice(i, 1);
    }
  },
  fold<V, A>(xs: V[], seed: A, f: (A, V) => A): A {
    for (var i = 0, x; i < xs.length; i++) {
      x = xs[i];
      seed = f(seed, x);
    }
    return seed;
  },
  flatMap(f, xs) {
    return _.fold(xs, [], (function(ys, x) {
      return ys.concat(f(x));
    }));
  },
  cached(f) {
    var value = None;
    return function() {
      if ((typeof value !== "undefined" && value !== null) ? value._isNone : undefined) {
        value = f();
        f = undefined;
      }
      return value;
    };
  },
  bind(fn, me) {
    return function() { return fn.apply(me, arguments); };
  },
  isFunction(f) { return typeof f === "function"; },

  toFunction<V, V2>(f: ((V) => V2) | V2): ((V) => V2) {
    if (typeof f == "function") {
      return f
    }
    return x => f
  },

  toString(obj) {
    var hasProp = {}.hasOwnProperty;
    try {
      recursionDepth++;
      if (obj == null) {
        return "undefined";
      } else if (_.isFunction(obj)) {
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
        var results: string[] = [];
        for (var key in obj) {
          if (!hasProp.call(obj, key)) continue;
          let value = (function() {
            try {
              return obj[key];
            } catch (error) {
              return error;
            }
          })();
          results.push(_.toString(key) + ":" + _.toString(value));
        }
        return "{" + results + "}";
      } else {
        return obj;
      }
    } finally {
      recursionDepth--;
    }
  }
};

var recursionDepth = 0;
export default _;
