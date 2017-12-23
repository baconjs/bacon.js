// build-dependencies: flatmap

Bacon.Observable.prototype.flatMapWithConcurrencyLimit = function(limit, ...args) {
  return flatMap_(this, makeSpawner(args), new Bacon.Desc(this, "flatMapWithConcurrencyLimit", [limit, ...args]), { limit })
};
