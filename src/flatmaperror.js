// build-dependencies: flatmap_

Bacon.Observable.prototype.flatMapError = function(fn) {
  return this.flatMap_(
    (x) => {
      if (x instanceof Error) {
        return fn(x.error);
      } else {
        return x;
      }
    }, 
    new Bacon.Desc(this, "flatMapError", [fn]), 
    { mapError: true }
  )
};
