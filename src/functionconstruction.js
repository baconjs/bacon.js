// build-dependencies: _

var withMethodCallSupport = function(wrapped) {
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
};

var makeFunctionArgs = function(args) {
  args = Array.prototype.slice.call(args);
  return makeFunction_(...args);
};

var partiallyApplied = function(f, applied) {
  return function(...args) { return f(...(applied.concat(args))); };
};

var toSimpleExtractor = function(args) {
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
};

var toFieldExtractor = function(f, args) {
  var parts = f.slice(1).split(".");
  var partFuncs = _.map(toSimpleExtractor(args), parts);
  return function(value) {
    for (var i = 0, f; i < partFuncs.length; i++) {
      f = partFuncs[i];
      value = f(value);
    }
    return value;
  };
};

var isFieldKey = function(f) {
  return (typeof f === "string") && f.length > 1 && f.charAt(0) === ".";
};

var makeFunction_ = withMethodCallSupport(function(f, ...args) {
  if (_.isFunction(f) ) {
    if (args.length) { return partiallyApplied(f, args); } else { return f; }
  } else if (isFieldKey(f)) {
    return toFieldExtractor(f, args);
  } else {
    return _.always(f);
  }
});

var makeFunction = function(f, args) {
  return makeFunction_(f, ...args);
};

var convertArgsToFunction = function(obs, f, args, method) {
  if (f && f._isProperty) {
    var sampled = f.sampledBy(obs, function(p,s) { return [p,s]; });
    return method.call(sampled, function([p, s]) { return p; })
      .map(function([p, s]) { return s; });
  } else {
    f = makeFunction(f, args);
    return method.call(obs, f);
  }
};

var toCombinator = function(f) {
  if (_.isFunction(f)) {
    return f;
  } else if (isFieldKey(f) ) {
    var key = toFieldKey(f);
    return (function(left, right) {
      return left[key](right);
    });
  } else {
    throw new Exception("not a function or a field key: " + f);
  }
};

var toFieldKey = function(f) {
  return f.slice(1);
};
