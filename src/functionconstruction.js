import _ from './_';

export function withMethodCallSupport(wrapped) {
  return function(f, ...args) {
    if (typeof f === "object" && args.length) {
      var context = f;
      var methodName = args[0];
      f = function() {
        return context[methodName](...arguments);
      };
      args = args.slice(1);
    }
    return wrapped(f, ...args);
  };
}

export function partiallyApplied(f, applied) {
  return function(...args) { return f(...(applied.concat(args))); };
}

export function toSimpleExtractor(args) {
  return function(key) {
    return function(value) {
      if (!(typeof value !== "undefined" && value !== null)) {
        return
      } else {
        var fieldValue = value[key];
        if (_.isFunction(fieldValue)) {
          return fieldValue.apply(value, args);
        } else {
          return fieldValue;
        }
      }
    };
  };
}

export function toFieldExtractor(f, args) {
  var parts = f.slice(1).split(".");
  var partFuncs = _.map(toSimpleExtractor(args), parts);
  return function(value) {
    for (var i = 0, f; i < partFuncs.length; i++) {
      f = partFuncs[i];
      value = f(value);
    }
    return value;
  };
}

export function isFieldKey(f) {
  return (typeof f === "string") && f.length > 1 && f.charAt(0) === ".";
}

const makeFunction_ = withMethodCallSupport(function(f, ...args) {
  if (_.isFunction(f) ) {
    if (args.length) { return partiallyApplied(f, args); } else { return f; }
  } else if (isFieldKey(f)) {
    return toFieldExtractor(f, args);
  } else {
    return _.always(f);
  }
});

export function makeFunction(f, args) {
  return makeFunction_(f, ...args);
}