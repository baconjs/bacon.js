var nop = function() {};
var latter = function(_, x) { return x; };
var former = function(x, _) { return x; };
var cloneArray = function(xs) { return xs.slice(0); };
var assert = function(message, condition) {
  if (!condition) {
    throw new Exception(message);
  }
};
var assertObservableIsProperty = function(x) {
  if ((x != null ? x._isObservable : void 0) && !(x != null ? x._isProperty : void 0)) {
    throw new Exception("Observable is not a Property : " + x);
  }
};
var assertEventStream = function(event) {
  if (!(event != null ? event._isEventStream : void 0)) {
    throw new Exception("not an EventStream : " + event);
  }
};

var assertObservable = function(event) {
  if (!(event != null ? event._isObservable : void 0)) {
    throw new Exception("not an Observable : " + event);
  }
};
var assertFunction = function(f) {
  return assert("not a function : " + f, _.isFunction(f));
};
var isArray = function(xs) { return xs instanceof Array; };
var isObservable = function(x) {
  return x && x._isObservable;
};
var assertArray = function(xs) {
  if (!isArray(xs)) {
    throw new Exception("not an array : " + xs);
  }
};
var assertNoArguments = function(args) { return assert("no arguments supported", args.length === 0); };
var assertString = function(x) {
  if (typeof x === "string") {
    throw new Exception("not a string : " + x);
  }
};

var extend = function(target) {
  var length = arguments.length;
  for (var i = 1; 1 < length ? i < length : i > length; 1 < length ? i++ : i--) {
    for (var prop in arguments[i]) {
      target[prop] = arguments[i][prop];
    }
  }
  return target;
};

var inherit = function(child, parent) {
  var hasProp = {}.hasOwnProperty;
  var ctor = function() {};
  ctor.prototype = parent.prototype;
  child.prototype = new ctor();
  for (var key in parent) {
    if (hasProp.call(parent, key)) {
      child[key] = parent[key];
    }
  }
  return child;
};
