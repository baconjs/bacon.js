# build-dependencies: eventstream

Bacon.EventStream :: skipWhile = (f, args...) ->
  ok = false
  convertArgsToFunction this, f, args, (f) ->
    withDescription(this, "skipWhile", f, @withHandler (event) ->
      if ok or !event.hasValue() or !f(event.value())
        ok = true if event.hasValue()
        @push event
      else
        Bacon.more)

