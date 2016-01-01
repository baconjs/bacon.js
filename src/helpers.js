import _ from './_';
import Exception from './exception';

export function nop() {}
export function latter(_, x) { return x; }
export function former(x, _) { return x; }
export function cloneArray(xs) { return xs.slice(0); }
export function assert(message, condition) {
  if (!condition) {
    throw new Exception(message);
  }
}

export function assertObservableIsProperty(x) {
  if ((x != null ? x._isObservable : void 0) && !(x != null ? x._isProperty : void 0)) {
    throw new Exception("Observable is not a Property : " + x);
  }
}
export function assertEventStream(event) {
  if (!(event != null ? event._isEventStream : void 0)) {
    throw new Exception("not an EventStream : " + event);
  }
}

export function assertObservable(event) {
  if (!(event != null ? event._isObservable : void 0)) {
    throw new Exception("not an Observable : " + event);
  }
}

export function assertFunction(f) {
  return assert("not a function : " + f, _.isFunction(f));
}
export function isArray(xs) {
  return xs instanceof Array;
}

export function isObservable(x) {
  return x && x._isObservable;
}
export function assertArray(xs) {
  if (!isArray(xs)) {
    throw new Exception("not an array : " + xs);
  }
}
export function assertNoArguments(args) {
  return assert("no arguments supported", args.length === 0);
}

export function assertString(x) {
  if (typeof x === "string") {
    throw new Exception("not a string : " + x);
  }
}

export function extend(target) {
  var length = arguments.length;
  for (var i = 1; 1 < length ? i < length : i > length; 1 < length ? i++ : i--) {
    for (var prop in arguments[i]) {
      target[prop] = arguments[i][prop];
    }
  }
  return target;
}

export function inherit(child, parent) {
  const hasProp = {}.hasOwnProperty;
  function ctor() {}
  ctor.prototype = parent.prototype;
  child.prototype = new ctor();
  for (var key in parent) {
    if (hasProp.call(parent, key)) {
      child[key] = parent[key];
    }
  }
  return child;
}
