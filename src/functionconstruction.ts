import _ from './_';

function withMethodCallSupport(wrapped) {
  return function(f, ...args) {
    if (typeof f === "object" && args.length) {
      var context = f;
      var methodName = args[0];
      f = function(...args) {
        return context[methodName](...args);
      };
      args = args.slice(1);
    }
    return wrapped(f, ...args);
  };
}

function partiallyApplied(f, applied) {
  return function(...args) { return f(...(applied.concat(args))); };
}

const makeFunction_ = withMethodCallSupport(function(f, ...args) {
  if (_.isFunction(f) ) {
    if (args.length) { return partiallyApplied(f, args); } else { return f; }
  } else {
    return _.always(f);
  }
});

export function makeFunction(f, args) {
  return makeFunction_(f, ...args);
}