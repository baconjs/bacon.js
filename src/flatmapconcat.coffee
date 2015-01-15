# build-dependencies: flatmapwithconcurrencylimit

Bacon.Observable :: flatMapConcat = ->
  withDescription(this, "flatMapConcat", arguments...,
    @flatMapWithConcurrencyLimit 1, arguments...)
