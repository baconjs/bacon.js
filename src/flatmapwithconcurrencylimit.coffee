# build-dependencies: flatmap

Bacon.Observable.prototype.flatMapWithConcurrencyLimit = (limit, args...) ->
  desc = new Bacon.Desc(this, "flatMapWithConcurrencyLimit", [limit, args...])
  withDesc(desc, flatMap_ this, makeSpawner(args), false, limit)
