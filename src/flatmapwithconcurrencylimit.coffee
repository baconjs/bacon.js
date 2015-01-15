# build-dependencies: flatmap

Bacon.Observable :: flatMapWithConcurrencyLimit = (limit, args...) ->
  withDescription(this, "flatMapWithConcurrencyLimit", limit, args...,
    flatMap_ this, makeSpawner(args), false, limit)
