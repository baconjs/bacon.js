# build-dependencies: observable

Bacon.Observable :: doAction = ->
  f = makeFunctionArgs(arguments)
  withDescription(this, "doAction", f, @withHandler (event) ->
    f(event.value()) if event.hasValue()
    @push event)
