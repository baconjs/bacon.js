# build-dependencies: observable

Bacon.Observable :: mapError = ->
  f = makeFunctionArgs(arguments)
  withDescription(this, "mapError", f, @withHandler (event) ->
    if event.isError()
      @push nextEvent (f event.error)
    else
      @push event)
