# build-dependencies: factories
# build-dependencies: event
# build-dependencies: describe

valueAndEnd = ((value) ->
  [value, endEvent()])

Bacon.fromPromise = (promise, abort) ->
  withDescription(Bacon, "fromPromise", promise, Bacon.fromBinder((handler) ->
    promise.then(handler, (e) -> handler(new Error(e)))?.done?()
    -> promise.abort?() if abort
  , valueAndEnd))
