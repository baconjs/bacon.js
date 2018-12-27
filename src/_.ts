import { isArray } from './helpers';


/** @hidden */
export function all<A>(xs: A[], f: (x: A) => boolean): boolean {
  for (var i = 0, x; i < xs.length; i++) {
    x = xs[i];
    if (!f(x)) { return false; }
  }
  return true;
}

/** @hidden */
export function always<A>(x: A) { return () => x; }

/** @hidden */
export function any<A>(xs: A[], f: (x: A) => boolean) {
  for (var i = 0, x; i < xs.length; i++) {
    x = xs[i];
    if (f(x)) { return true; }
  }
  return false;
}

/** @hidden */
export function bind<F extends Function>(fn: F, me: any): F {
  return <any>function() { return fn.apply(me, arguments); };
}

/** @hidden */
export function contains<A>(xs: A[], x: A) { return indexOf(xs, x) !== -1; }

/** @hidden */
export function each<A>(xs: any, f: (key: string, x: A) => any) {
  for (var key in xs) {
    if (Object.prototype.hasOwnProperty.call(xs, key)) {
      var value = xs[key];
      f(key, value);
    }
  }
}

/** @hidden */
export function empty<A>(xs: A[]) { return xs.length === 0; }

/** @hidden */
export function filter<A>(f: (a: A) => boolean, xs: A[]): A[] {
  var filtered: A[] = [];
  for (var i = 0, x; i < xs.length; i++) {
    x = xs[i];
    if (f(x)) { filtered.push(x); }
  }
  return filtered;
}

/** @hidden */
export function flatMap<A, B>(f: (x: A) => B[], xs: A[]): B[] {
  return fold(xs, [], (function(ys: B[], x: A) {
    return ys.concat(f(x));
  }));
}

/** @hidden */
export function flip<A, B, C>(f: (a: A, b: B) => C): ((b: B, a: A) => C) {
  return (a, b) => f(b, a)
}

/** @hidden */
export function fold<V, A>(xs: V[], seed: A, f: (acc: A, x: V) => A): A {
  for (var i = 0, x; i < xs.length; i++) {
    x = xs[i];
    seed = f(seed, x);
  }
  return seed;
}

/** @hidden */
export function head<V>(xs: V[]): V { 
  return xs[0]; 
}

/** @hidden */
export function id<A>(x: A): A { return x; }

/** @hidden */
function indexOfDefault<A>(xs: A[], x: A) { return xs.indexOf(x); }

/** @hidden */
function indexOfFallback<A>(xs: A[], x: A) {
  for (var i = 0, y; i < xs.length; i++) {
    y = xs[i];
    if (x === y) { return i; }
  }
  return -1;
}

/** @hidden */
export const indexOf = Array.prototype.indexOf ? indexOfDefault : indexOfFallback  

/** @hidden */
export function indexWhere<A>(xs: A[], f: (x: A) => boolean): number {
  for (var i = 0, y; i < xs.length; i++) {
    y = xs[i];
    if (f(y)) { return i; }
  }
  return -1;
}

/** @hidden */
export function isFunction(f: any): f is Function { return typeof f === "function"; }

/** @hidden */
export function last<A>(xs: A[]) { return xs[xs.length - 1]; }

/** @hidden */
export function map<A, B>(f: (a: A) => B, xs: A[]): B[] {
  var result: B[] = [];
  for (var i = 0, x; i < xs.length; i++) {
    x = xs[i];
    result.push(f(x));
  }
  return result;
}

/** @hidden */
export function negate<A>(f: (x: A) => boolean): (x: A) => boolean { return function(x: A) { return !f(x); }; }

/** @hidden */
export function remove<V>(x: V, xs: V[]): V[] | undefined {
  var i = indexOf(xs, x);
  if (i >= 0) {
    return xs.splice(i, 1);
  }
}

/** @hidden */
export function tail<V>(xs: V[]): V[] { 
  return xs.slice(1, xs.length); 
}

/** @hidden */
export function toArray<A>(xs: A[] | A): A[] { return <any>(isArray(xs) ? xs : [xs]) }

/** @hidden */
export function toFunction<V, V2>(f: ((x: V) => V2) | V2): ((x: V) => V2) {
    if (typeof f == "function") {
      return f
    }
    return x => f
  }

/** @hidden */
export function toString(obj: any): string {
  var hasProp = {}.hasOwnProperty;
  try {
    recursionDepth++;
    if (obj == null) {
      return "undefined";
    } else if (isFunction(obj)) {
      return "function";
    } else if (isArray(obj)) {
      if (recursionDepth > 5) {
        return "[..]";
      }
      return "[" + map(toString, obj).toString() + "]";
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
        results.push(toString(key) + ":" + toString(value));
      }
      return "{" + results + "}";
    } else {
      return obj;
    }
  } finally {
    recursionDepth--;
  }
}

/** @hidden */
export function without<A>(x: A, xs: A[]) {
  return filter((function(y: A) { return y !== x; }), xs);
}

var _ = {
  indexOf,  
  indexWhere,
  head,
  always,
  negate,
  empty,
  tail,
  filter,
  map,
  each,
  toArray,
  contains,
  id,
  last,
  all,
  any,
  without,
  remove,
  fold,
  flatMap,
  bind,
  isFunction,
  toFunction,
  toString
};

var recursionDepth = 0;

export default _;
