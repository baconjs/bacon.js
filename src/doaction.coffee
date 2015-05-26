# build-dependencies: observable

Bacon.Observable :: doAction = ->
  f = makeFunctionArgs(arguments)
  withDesc(new Bacon.Desc(this, "doAction", [f]), @withHandler (event) ->
    f(event.value()) if event.hasValue()
    @push event)
