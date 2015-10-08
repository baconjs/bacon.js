// build-dependencies: when, scan

Bacon.update = function(initial, ...patterns) {
  function lateBindFirst(f) {
    return function(...args) {
      return function(i) {
        return f(...[i].concat(args));
      };
    };
  }

  var i = patterns.length - 1;
  while (i > 0) {
    if (!(patterns[i] instanceof Function)) {
      patterns[i] = _.always(patterns[i]);
    }
    patterns[i] = lateBindFirst(patterns[i]);
    i = i - 2;
  }
  return withDesc(new Bacon.Desc(Bacon, "update", [initial, ...patterns]), Bacon.when(...patterns).scan(initial, (function(x,f) { return f(x); })));
};
