# build-dependencies: core, combine, factories

liftCallback = (desc, wrapped) ->
  withMethodCallSupport (f, args...) ->
    stream = partiallyApplied(wrapped, [(values, callback) ->
      f(values..., callback)])
    withDescription(Bacon, desc, f, args..., Bacon.combineAsArray(args).flatMap(stream))

Bacon.fromCallback = liftCallback "fromCallback", (f, args...) ->
  Bacon.fromBinder (handler) ->
    makeFunction(f, args)(handler)
    nop
  , ((value) -> [value, end()])

Bacon.fromNodeCallback = liftCallback "fromNodeCallback", (f, args...) ->
  Bacon.fromBinder (handler) ->
    makeFunction(f, args)(handler)
    nop
  , (error, value) ->
    return [new Error(error), end()] if error
    [value, end()]

