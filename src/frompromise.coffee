# build-dependencies: factories
# build-dependencies: event
# build-dependencies: describe

valueAndEnd = ((value) ->
  [value, endEvent()])

Bacon.fromPromise = (promise, abort, eventTransformer = valueAndEnd) ->
  withDesc(new Bacon.Desc(Bacon, "fromPromise", [promise]), Bacon.fromBinder((handler) ->
    promise.then(handler, (e) -> handler(new Error(e)))?.done?()
    -> promise.abort?() if abort
  , eventTransformer))
