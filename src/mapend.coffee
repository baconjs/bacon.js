# build-dependencies: observable

Bacon.Observable :: mapEnd = ->
  f = makeFunctionArgs(arguments)
  withDescription(this, "mapEnd", f, @withHandler (event) ->
    if (event.isEnd())
      @push nextEvent(f(event))
      @push endEvent()
      Bacon.noMore
    else
      @push event)
