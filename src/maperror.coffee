# build-dependencies: observable, describe

Bacon.Observable :: mapError = ->
  f = makeFunctionArgs(arguments)
  withDesc(new Bacon.Desc(this, "mapError", [f]), @withHandler (event) ->
    if event.isError()
      @push nextEvent (f event.error)
    else
      @push event)
