# build-dependencies: frombinder

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
