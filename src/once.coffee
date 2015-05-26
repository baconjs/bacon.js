# build-dependencies: eventstream, event
Bacon.once = (value) ->
  new EventStream (new Desc(Bacon, "once", [value])), (sink) ->
    sink (toEvent(value))
    sink (endEvent())
    nop
