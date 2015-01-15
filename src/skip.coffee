# build-dependencies: core

Bacon.Observable :: skip = (count) ->
  withDescription(this, "skip", count, @withHandler (event) ->
    unless event.hasValue()
      @push event
    else if (count > 0)
      count--
      Bacon.more
    else
      @push event)
