# build-dependencies: core

Bacon.Observable :: take = (count) ->
  return Bacon.never() if count <= 0
  withDesc(new Bacon.Desc(this, "take", [count]), @withHandler (event) ->
    unless event.hasValue()
      @push event
    else
      count--
      if count > 0
        @push event
      else
        @push event if count == 0
        @push endEvent()
        Bacon.noMore)
