# build-dependencies: core

Bacon.Observable :: endOnError = (f, args...) ->
  f = true unless f?
  convertArgsToFunction this, f, args, (f) ->
    withDesc(new Bacon.Desc(this, "endOnError", []), @withHandler (event) ->
      if event.isError() and f(event.error)
        @push event
        @push endEvent()
      else
        @push event)
