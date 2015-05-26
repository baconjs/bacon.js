# build-dependencies: observable, filter, helpers

Bacon.Observable :: takeWhile = (f, args...) ->
  assertObservableIsProperty(f)
  convertArgsToFunction this, f, args, (f) ->
    withDesc(new Bacon.Desc(this, "takeWhile", [f]), @withHandler (event) ->
      if event.filter(f)
        @push event
      else
        @push endEvent()
        Bacon.noMore)
