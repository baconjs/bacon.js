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
eventMethods = [
  ["addEventListener","removeEventListener"]
  ["addListener", "removeListener"]
  ["on", "off"]
  ["bind", "unbind"]
]
findHandlerMethods = (target) ->
  for pair in eventMethods
    methodPair = [target[pair[0]], target[pair[1]]]
    return methodPair if methodPair[0] and methodPair[1]
  throw new Error("No suitable event methods in " + target)

Bacon.fromEventTarget = (target, eventName, eventTransformer) ->
  [sub, unsub] = findHandlerMethods target
  withDesc(new Bacon.Desc(Bacon, "fromEvent", [target, eventName]), Bacon.fromBinder (handler) ->
    sub.call(target, eventName, handler)
    -> unsub.call(target, eventName, handler)
  , eventTransformer)

Bacon.fromEvent = Bacon.fromEventTarget

