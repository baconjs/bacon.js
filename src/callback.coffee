# build-dependencies: core, combine, factories, flatmap

liftCallback = (desc, wrapped) ->
  withMethodCallSupport (f, args...) ->
    stream = partiallyApplied(wrapped, [(values, callback) ->
      f(values..., callback)])
    withDesc(new Bacon.Desc(Bacon, desc, [f, args...]), Bacon.combineAsArray(args).flatMap(stream))

Bacon.fromCallback = liftCallback "fromCallback", (f, args...) ->
  Bacon.fromBinder (handler) ->
    makeFunction(f, args)(handler)
    nop
  , ((value) -> [value, endEvent()])

Bacon.fromNodeCallback = liftCallback "fromNodeCallback", (f, args...) ->
  Bacon.fromBinder (handler) ->
    makeFunction(f, args)(handler)
    nop
  , (error, value) ->
    return [new Error(error), endEvent()] if error
    [value, endEvent()]

