# build-dependencies: _
# build-dependencies: scheduler
# build-dependencies: functionconstruction
# build-dependencies: updatebarrier
# build-dependencies: event
# build-dependencies: observable
# build-dependencies: eventstream
# build-dependencies: property
# build-dependencies: factories
# build-dependencies: when
# build-dependencies: describe

registerObs = ->

Bacon.noMore = ["<no-more>"]
Bacon.more = ["<more>"]

addPropertyInitValueToStream = (property, stream) ->
  justInitValue = new EventStream describe(property, "justInitValue"), (sink) ->
    value = undefined
    unsub = property.dispatcher.subscribe (event) ->
      if !event.isEnd()
        value = event
      Bacon.noMore
    UpdateBarrier.whenDoneWith justInitValue, ->
      if value?
        sink value
      sink endEvent()
    unsub
  justInitValue.concat(stream).toProperty()


nop = ->
latter = (_, x) -> x
former = (x, _) -> x
initialEvent = (value) -> new Initial(value, true)
nextEvent = (value) -> new Next(value, true)
endEvent = -> new End()
# instanceof more performant than x.?isEvent?()
toEvent = (x) -> if x instanceof Event then x else nextEvent x
cloneArray = (xs) -> xs.slice(0)
assert = (message, condition) -> throw new Exception(message) unless condition
assertEventStream = (event) -> throw new Exception("not an EventStream : " + event) unless event instanceof EventStream
assertObservable = (event) -> throw new Exception("not an Observable : " + event) unless event instanceof Observable
assertFunction = (f) -> assert "not a function : " + f, _.isFunction(f)
isArray = (xs) -> xs instanceof Array
isObservable = (x) -> x instanceof Observable
assertArray = (xs) -> throw new Exception("not an array : " + xs) unless isArray(xs)
assertNoArguments = (args) -> assert "no arguments supported", args.length == 0
assertString = (x) -> throw new Exception("not a string : " + x) unless typeof x == "string"

constantToFunction = (f) ->
  if _.isFunction f
    f
  else
    _.always(f)

makeObservable = (x) ->
  if (isObservable(x))
    x
  else
    Bacon.once(x)
Bacon.isFieldKey = isFieldKey

toFieldKey = (f) ->
  f.slice(1)
toCombinator = (f) ->
  if _.isFunction f
    f
  else if isFieldKey f
    key = toFieldKey(f)
    (left, right) ->
      left[key](right)
  else
    assert "not a function or a field key: " + f, false

