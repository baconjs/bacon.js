# build-dependencies: core

Bacon.Observable :: skip = (count) ->
  withDesc(new Bacon.Desc(this, "skip", [count]), @withHandler (event) ->
    unless event.hasValue()
      @push event
    else if (count > 0)
      count--
      Bacon.more
    else
      @push event)
