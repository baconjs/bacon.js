// build-dependencies: flatmap

Bacon.Observable.prototype.flatMapWithConcurrencyLimit = function(limit, ...args) {
  var desc = new Bacon.Desc(this, "flatMapWithConcurrencyLimit", [limit, ...args]);
  return withDesc(desc, flatMap_(this, makeSpawner(args), false, limit));
};
