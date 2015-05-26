# build-dependencies: flatmapwithconcurrencylimit

Bacon.Observable :: flatMapConcat = ->
  withDesc(new Bacon.Desc(this, "flatMapConcat", Array.prototype.slice.call(arguments, 0)),
    @flatMapWithConcurrencyLimit 1, arguments...)
