// build-dependencies: flatmap

Bacon.Observable.prototype.flatMapWithConcurrencyLimit = function(limit, ...args) {
  return this.flatMap_(
    handleEventValueWith(makeSpawner(args)), 
    { 
      limit,
      desc: new Bacon.Desc(this, "flatMapWithConcurrencyLimit", [limit, ...args])
    }
  )
};
