# build-dependencies: observable, filter

Bacon.Observable :: takeWhile = (f, args...) ->
  convertArgsToFunction this, f, args, (f) ->
    withDescription(this, "takeWhile", f, @withHandler (event) ->
      if event.filter(f)
        @push event
      else
        @push endEvent()
        Bacon.noMore)
