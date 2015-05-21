# build-dependencies: observable

Bacon.Observable :: doError = ->
  f = makeFunctionArgs(arguments)
  withDescription(this, "doError", f, @withHandler (event) ->
    f(event.error) if event.isError()
    @push event)
