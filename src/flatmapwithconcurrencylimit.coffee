# build-dependencies: flatmap

Bacon.Observable :: flatMapWithConcurrencyLimit = (limit, args...) ->
  withDesc(new Bacon.Desc(this, "flatMapWithConcurrencyLimit", [limit, args...]),
    flatMap_ this, makeSpawner(args), false, limit)
