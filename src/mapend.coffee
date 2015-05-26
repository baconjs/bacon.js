# build-dependencies: observable

Bacon.Observable :: mapEnd = ->
  f = makeFunctionArgs(arguments)
  withDesc(new Bacon.Desc(this, "mapEnd", [f]), @withHandler (event) ->
    if (event.isEnd())
      @push nextEvent(f(event))
      @push endEvent()
      Bacon.noMore
    else
      @push event)
