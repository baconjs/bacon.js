// build-dependencies: flatmap_

Bacon.Observable.prototype.flatMapError = function(fn) {
  var desc = new Bacon.Desc(this, "flatMapError", [fn]);

  return flatMap_(this, (x) => {
    if (x instanceof Error) {
      return fn(x.error);
    } else {
      return x;
    }
  }, desc, { forEvents: true })
};
