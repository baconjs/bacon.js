# build-dependencies: eventstream, event, updatebarrier
Bacon.once = (value) ->
  new EventStream describe(Bacon, "once", value), (sink) ->
    Bacon.scheduler.asap ->
      sink (toEvent(value))
      sink (endEvent())
    nop

Bacon.immediately = (value) ->
  new EventStream describe(Bacon, "immediately", value), (sink) ->
    sink (toEvent(value))
    sink (endEvent())
    nop
