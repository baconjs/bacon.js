// build-dependencies: core, combine, frombinder, flatmap

var liftCallback = function(desc, wrapped) {
  return withMethodCallSupport(function(f, ...args) {
    var stream = partiallyApplied(wrapped, [function(values, callback) {
      return f(...values, callback);
    }]);
    return withDesc(new Bacon.Desc(Bacon, desc, [f, ...args]), Bacon.combineAsArray(args).flatMap(stream));
  });
};

Bacon.fromCallback = liftCallback("fromCallback", function(f, ...args) {
  return Bacon.fromBinder(function(handler) {
    makeFunction(f, args)(handler);
    return nop;
  }, (function(value) { return [value, endEvent()]; }));
});

Bacon.fromNodeCallback = liftCallback("fromNodeCallback", function(f, ...args) {
  return Bacon.fromBinder(function(handler) {
    makeFunction(f, args)(handler);
    return nop;
  }, function(error, value) {
    if (error) { return [new Error(error), endEvent()]; }
    return [value, endEvent()];
  });
});
