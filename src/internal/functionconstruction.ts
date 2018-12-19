import _ from '../_';

function withMethodCallSupport(wrapped: Function) {
  return function(f: Function, ...args: any[]) {
    if (typeof f === "object" && args.length) {
      var context: any = f;
      var methodName = args[0];
      f = function(...args: any[]) {
        return context[methodName](...args);
      };
      args = args.slice(1);
    }
    return wrapped(f, ...args);
  };
}

function partiallyApplied(f: Function, applied: any[]) {
  return function(...args: any[]) { return f(...(applied.concat(args))); };
}

const makeFunction_ = withMethodCallSupport(function(f: Function, ...args: any[]) {
  if (_.isFunction(f) ) {
    if (args.length) { return partiallyApplied(f, args); } else { return f; }
  } else {
    return _.always(f);
  }
});

/** @hidden */
export function makeFunction(f: Function, args: any[]) {
  return makeFunction_(f, ...args);
}
