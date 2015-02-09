# build-dependencies: _
# build-dependencies: updatebarrier, eventstream, property, event
# build-dependencies: helpers

# eventTransformer - should return one value or one or many events
Bacon.fromBinder = (binder, eventTransformer = _.id) ->
  new EventStream describe(Bacon, "fromBinder", binder, eventTransformer), (sink) ->
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
      unless isArray(value) and _.last(value) instanceof Event
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

# Wrap DOM EventTarget, Node EventEmitter, or
# [un]bind: (Any, (Any) -> None) -> None interfaces
# common in MVCs as EventStream
#
# target - EventTarget or EventEmitter, source of events
# eventName - event name to bind
# eventTransformer - defaults to returning the first argument to handler
#
# Examples
#
#   Bacon.fromEventTarget(document.body, "click")
#   # => EventStream
#
#   Bacon.fromEventTarget (new EventEmitter(), "data")
#   # => EventStream
#
# Returns EventStream
Bacon.fromEventTarget = (target, eventName, eventTransformer) ->
  sub = target.addEventListener ? target.addListener ? target.bind ? target.on
  unsub = target.removeEventListener ? target.removeListener ? target.unbind ? target.off
  withDescription(Bacon, "fromEventTarget", target, eventName, Bacon.fromBinder (handler) ->
    sub.call(target, eventName, handler)
    -> unsub.call(target, eventName, handler)
  , eventTransformer)

Bacon.fromEvent = Bacon.fromEventTarget

Bacon.once = (value) ->
  new EventStream describe(Bacon, "once", value), (sink) ->
    sink (toEvent(value))
    sink (endEvent())
    nop

Bacon.fromArray = (values) ->
  assertArray values
  if !values.length
    withDescription(Bacon, "fromArray", values, Bacon.never())
  else
    i = 0
    new EventStream describe(Bacon, "fromArray", values), (sink) ->
      unsubd = false
      reply = Bacon.more
      push = ->
        if (reply != Bacon.noMore) and !unsubd
          value = values[i++]
          reply = sink(toEvent(value))
          if reply != Bacon.noMore
            if i == values.length
              sink(endEvent())
            else
              UpdateBarrier.afterTransaction push
      push()
      -> unsubd = true
