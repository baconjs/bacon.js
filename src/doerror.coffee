# build-dependencies: observable

Bacon.Observable :: doError = ->
  f = makeFunctionArgs(arguments)
  withDesc(new Bacon.Desc(this, "doError", [f]), @withHandler (event) ->
    f(event.error) if event.isError()
    @push event)
