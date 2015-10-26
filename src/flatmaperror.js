// build-dependencies: flatmap, maperror, once

Bacon.Observable.prototype.flatMapError = function(fn) {
  var desc = new Bacon.Desc(this, "flatMapError", [fn]);
  return withDesc(desc, this.mapError((err) => new Error(err)).flatMap((x) => {
    if (x instanceof Error) {
      return fn(x.error);
    } else {
      return Bacon.once(x);
    }
  }));
};
