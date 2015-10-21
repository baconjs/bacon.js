# build-dependencies: _
# build-dependencies: updatebarrier, eventstream, property, event
# build-dependencies: helpers

# eventTransformer - should return one value or one or many events
Bacon.fromBinder = (binder, eventTransformer = _.id) ->
  new EventStream (new Bacon.Desc(Bacon, "fromBinder", [binder, eventTransformer])), (sink) ->
    unbound = false
    shouldUnbind = false
    unbind = ->
      if not unbound
        if unbinder?
          unbinder()
          unbound = true
        else
          shouldUnbind = true
    unbinder = binder (args...) ->
      value = eventTransformer.apply(this, args)
      unless isArray(value) and _.last(value)?._isEvent
        value = [value]
      reply = Bacon.more
      for event in value
        reply = sink(event = toEvent(event))
        if reply == Bacon.noMore or event.isEnd()
          # defer if binder calls handler in sync before returning unbinder
          unbind()
          return reply
      reply
    if shouldUnbind
      unbind()
    unbind

