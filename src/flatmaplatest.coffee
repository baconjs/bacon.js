# build-dependencies: core, functionconstruction
# build-dependencies: compositeunsubscribe, takeuntil

Bacon.Observable :: flatMapLatest = ->
  f = makeSpawner(arguments)
  stream = @toEventStream()
  withDescription(this, "flatMapLatest", f, stream.flatMap (value) ->
    makeObservable(f(value)).takeUntil(stream))
