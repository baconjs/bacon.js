# build-dependencies: eventstream, event
Bacon.once = (value) ->
  new EventStream describe(Bacon, "once", value), (sink) ->
    sink (toEvent(value))
    sink (endEvent())
    nop
