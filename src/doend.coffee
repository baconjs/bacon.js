# build-dependencies: observable

Bacon.Observable :: doEnd = ->
  f = makeFunctionArgs(arguments)
  withDesc(new Bacon.Desc(this, "doEnd", [f]), @withHandler (event) ->
    f() if event.isEnd()
    @push event)
