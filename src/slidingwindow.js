// build-dependencies: scan, filter

Bacon.Observable.prototype.slidingWindow = function(n, minValues = 0) {
  return withDesc(new Bacon.Desc(this, "slidingWindow", [n, minValues]), this.scan([],
    (function(window, value) { return window.concat([value]).slice(-n); }))
      .filter((function(values) { return values.length >= minValues; })));
};
