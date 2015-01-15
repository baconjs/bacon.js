# build-dependencies: core

Bacon.Observable :: endOnError = (f, args...) ->
  f = true unless f?
  convertArgsToFunction this, f, args, (f) ->
    withDescription(this, "endOnError", @withHandler (event) ->
      if event.isError() and f(event.error)
        @push event
        @push endEvent()
      else
        @push event)
