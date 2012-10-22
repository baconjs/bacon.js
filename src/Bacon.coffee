(this.jQuery || this.Zepto)?.fn.asEventStream = (eventName, selector) ->
  element = this
  new EventStream (sink) ->
    handler = (event) ->
      reply = sink (next event)
      if (reply == Bacon.noMore)
        unbind()
    unbind = -> element.off(eventName, selector, handler)
    element.on(eventName, selector, handler)
    unbind

Bacon = @Bacon = {}

Bacon.fromPromise = (promise) ->
  new Bacon.EventStream(
    (sink) ->
      onSuccess = (value) ->
        sink (new Next value)
        sink (new End)
      onError = (e) ->
        sink (new Error e)
        sink (new End)
      promise.then(onSuccess, onError)
      nop
  )

Bacon.noMore = "veggies"

Bacon.more = "moar bacon!"

Bacon.never = => new EventStream (sink) =>
  => nop

Bacon.later = (delay, value) ->
  Bacon.sequentially(delay, [value])

Bacon.sequentially = (delay, values) ->
  index = -1
  poll = ->
    index++
    if index < values.length
      toEvent values[index]
    else
      end()
  Bacon.fromPoll(delay, poll)

Bacon.repeatedly = (delay, values) ->
  index = -1
  poll = ->
    index++
    toEvent values[index % values.length]
  Bacon.fromPoll(delay, poll)

Bacon.fromPoll = (delay, poll) ->
  new EventStream (sink) ->
    id = undefined
    handler = ->
      value = poll()
      reply = sink value
      if (reply == Bacon.noMore or value.isEnd())
        unbind()
    unbind = -> 
      clearInterval id
    id = setInterval(handler, delay)
    unbind

# Wrap DOM EventTarget or Node EventEmitter as EventStream
#
# target - EventTarget or EventEmitter, source of events
# eventName - event name to bind
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
Bacon.fromEventTarget = (target, eventName) ->
  new EventStream (sink) ->
    handler = (event) ->
      reply = sink (next event)
      if reply == Bacon.noMore
        unbind()

    if target.addEventListener
      unbind = -> target.removeEventListener(eventName, handler, false)
      target.addEventListener(eventName, handler, false)
    else
      unbind = -> target.removeListener(eventName, handler)
      target.addListener(eventName, handler)
    unbind

Bacon.interval = (delay, value) ->
  value = {} unless value?
  poll = -> next(value)
  Bacon.fromPoll(delay, poll)

Bacon.constant = (value) ->
  new Property(just(initial, value))

Bacon.once = (value) ->
  new EventStream(just(next, value))

just = (wrapper, value) ->
  (sink) ->
    sink (wrapper value)
    sink (end())
    nop

Bacon.combineAll = (streams, f) ->
  assertArray streams
  stream = head streams
  for next in (tail streams)
    stream = f(stream, next)
  stream

Bacon.mergeAll = (streams) ->
  Bacon.combineAll(streams, (s1, s2) -> s1.merge(s2))

Bacon.combineAsArray = (streams) ->
  assertArray streams
  stream = (head streams).toProperty().map((x) -> [x])
  for next in (tail streams)
    stream = stream.combine(next, (xs, x) -> xs.concat([x]))
  stream

Bacon.combineWith = (streams, f) ->
  Bacon.combineAll(streams, (s1, s2) ->
    s1.toProperty().combine(s2, f))

Bacon.combineTemplate = (template) ->
  funcs = []
  streams = []
  current = (ctxStack) -> ctxStack[ctxStack.length - 1]
  setValue = (ctxStack, key, value) -> current(ctxStack)[key] = value
  applyStreamValue = (key, index) -> (ctxStack, values) -> setValue(ctxStack, key, values[index])
  constantValue = (key, value) -> (ctxStack, values) -> setValue(ctxStack, key, value)
  compileTemplate = (template) ->
    for key, value of template
      if (value instanceof Observable)
        streams.push(value)
        funcs.push(applyStreamValue(key, streams.length - 1))
      else if (typeof value == "object")
        pushContext = (key) -> (ctxStack, values) ->
          newContext = {}
          setValue(ctxStack, key, newContext)
          ctxStack.push(newContext)
        popContext = (ctxStack, values) -> ctxStack.pop()
        funcs.push(pushContext(key))
        compileTemplate(value)
        funcs.push(popContext)
      else
        funcs.push(constantValue(key, value))
  compileTemplate template
  combinator = (values) ->
    rootContext = {}
    ctxStack = [rootContext]
    for f in funcs 
       f(ctxStack, values)
    rootContext
  Bacon.combineAsArray(streams).map(combinator)

Bacon.latestValue = (src) ->
  latest = undefined
  src.subscribe (event) ->
    latest = event.value if event.hasValue()
  => latest

class Event
  isEvent: -> true
  isEnd: -> false
  isInitial: -> false
  isNext: -> false
  isError: -> false
  hasValue: -> false
  filter: (f) -> true
  getOriginalEvent: -> 
    if @sourceEvent? 
      @sourceEvent.getOriginalEvent() 
    else 
      this
  onDone : (listener) -> listener()

class Next extends Event
  constructor: (@value, sourceEvent) ->
  isNext: -> true
  hasValue: -> true
  fmap: (f) -> @apply(f(this.value))
  apply: (value) -> next(value, @getOriginalEvent())
  filter: (f) -> f(@value)
  describe: -> @value

class Initial extends Next
  isInitial: -> true
  isNext: -> false
  apply: (value) -> initial(value, @getOriginalEvent())

class End extends Event
  isEnd: -> true
  fmap: -> this
  apply: -> this
  describe: -> "<end>"

class Error extends Event
  constructor: (@error) ->
  isError: -> true
  fmap: -> this
  apply: -> this
  describe: -> "<error> #{@error}"

class Observable
  constructor: ->
    @assign = @onValue
  onValue: (f, args...) -> 
    f = makeFunction(f, args)
    @subscribe (event) ->
      f event.value if event.hasValue()
  onError: (f, args...) -> 
    f = makeFunction(f, args)
    @subscribe (event) ->
      f event.error if event.isError()
  onEnd: (f, args...) -> 
    f = makeFunction(f, args)
    @subscribe (event) ->
      f() if event.isEnd()
  errors: -> @filter(-> false)
  filter: (f, args...) ->
    f = makeFunction(f, args)
    @withHandler (event) -> 
      if event.filter(f)
        @push event
      else
        Bacon.more
  takeWhile: (f, args...) ->
    f = makeFunction(f, args)
    @withHandler (event) -> 
      if event.filter(f)
        @push event
      else
        @push end()
        Bacon.noMore
  endOnError: ->
    @withHandler (event) ->
      if event.isError()
        @push event
        @push end()
      else
        @push event
  take: (count) ->
    assert "take: count must >= 1", (count>=1)
    @withHandler (event) ->
      if !event.hasValue()
        @push event
      else if (count == 1)
        @push event
        @push end()
        Bacon.noMore
      else
        count--
        @push event
  map: (f, args...) ->
    f = makeFunction(f, args)
    @withHandler (event) -> 
      @push event.fmap(f)
  mapError : (f, args...) ->
    f = makeFunction(f, args)
    @withHandler (event) ->
      if event.isError()
        @push next (f event.error)
      else
        @push event

  do: (f, args...) ->
    f = makeFunction(f, args)
    @withHandler (event) ->
      f(event.value) if event.hasValue()
      @push event
  takeUntil: (stopper) =>
    src = this
    @withSubscribe (sink) ->
      unsubscribed = false
      unsubSrc = nop
      unsubStopper = nop
      unsubBoth = -> unsubSrc() ; unsubStopper() ; unsubscribed = true
      srcSink = (event) ->
        if event.isEnd()
          unsubStopper()
          sink event
          Bacon.noMore
        else
          event.getOriginalEvent().onDone ->
            if !unsubscribed
              reply = sink event
              if reply == Bacon.noMore
                unsubBoth()
          Bacon.more
      stopperSink = (event) ->
        if event.isError()
          Bacon.more
        else if event.isEnd()
          Bacon.noMore
        else
          unsubSrc()
          sink end()
          Bacon.noMore
      unsubSrc = src.subscribe(srcSink)
      unsubStopper = stopper.subscribe(stopperSink) unless unsubscribed
      unsubBoth
  skip : (count) ->
    assert "skip: count must >= 0", (count>=0)
    @withHandler (event) ->
      if !event.hasValue()
        @push event
      else if (count > 0)
        count--
        Bacon.more
      else
        @push event
  distinctUntilChanged: -> @skipDuplicates()
  skipDuplicates: ->
    @withStateMachine undefined, (prev, event) ->
      if !event.hasValue()
        [prev, [event]]
      else if prev isnt event.value
        [event.value, [event]]
      else
        [prev, []]

  withStateMachine: (initState, f) ->
    state = initState
    @withHandler (event) ->
      fromF = f(state, event)
      assertArray fromF
      [newState, outputs] = fromF
      assertArray outputs
      state = newState
      reply = Bacon.more
      for output in outputs
        reply = @push output
        if reply == Bacon.noMore
          return reply
      reply
  flatMap: (f) ->
    root = this
    new EventStream (sink) ->
      children = []
      rootEnd = false
      unsubRoot = ->
      unbind = ->
        unsubRoot()
        for unsubChild in children
          unsubChild()
        children = []
      checkEnd = ->
        if rootEnd and (children.length == 0)
          sink end()
      spawner = (event) ->
        if event.isEnd()
          rootEnd = true
          checkEnd()
        else if event.isError()
          sink event
        else
          child = f event.value
          unsubChild = undefined
          childEnded = false
          removeChild = ->
            remove(unsubChild, children) if unsubChild?
            checkEnd()
          handler = (event) ->
            if event.isEnd()
              removeChild()
              childEnded = true
              Bacon.noMore
            else
              reply = sink event
              if reply == Bacon.noMore
                unbind()
              reply
          unsubChild = child.subscribe handler
          children.push unsubChild if not childEnded
      unsubRoot = root.subscribe(spawner)
      unbind
  not: -> @map((x) -> !x)
  log: -> 
    @subscribe (event) -> console.log(event.describe())
    undefined

class EventStream extends Observable
  constructor: (subscribe) ->
    super()
    assertFunction subscribe
    dispatcher = new Dispatcher(subscribe)
    @subscribe = dispatcher.subscribe
    @hasSubscribers = dispatcher.hasSubscribers
  map: (p, args...) ->
    if (p instanceof Property)
      p.sampledBy(this, former)
    else
      super(p, args...)
  filter: (p, args...) ->
    if (p instanceof Property)
      p.sampledBy(this, (p,s) -> [p,s])
       .filter(([p, s]) -> p)
       .map(([p, s]) -> s)
    else
      super(p, args...)
  switch: (f) =>
    @flatMap (value) =>
      f(value).takeUntil(this)
  delay: (delay) ->
    @flatMap (value) ->
      Bacon.later delay, value
  throttle: (delay) ->
    @switch (value) ->
      Bacon.later delay, value
  bufferWithTime: (delay) ->
    values = []
    storeAndMaybeTrigger = (value) ->
      values.push value
      values.length == 1
    flush = ->
      output = values
      values = []
      output
    buffer = ->
      Bacon.later(delay).map(flush)
    @filter(storeAndMaybeTrigger).flatMap(buffer)
  bufferWithCount: (count) ->
    values = []
    @withHandler (event) ->
      flush = =>
        @push next(values, event)
        values = []
      if event.isError()
        @push event
      else if event.isEnd()
        flush()
        @push event
      else
        values.push(event.value)
        flush() if values.length == count
  merge: (right) -> 
    left = this
    new EventStream (sink) ->
      unsubLeft = nop
      unsubRight = nop
      unsubscribed = false
      unsubBoth = -> unsubLeft() ; unsubRight() ; unsubscribed = true
      ends = 0
      smartSink = (event) ->
        if event.isEnd()
          ends++
          if ends == 2
            sink end()
          else
            Bacon.more
        else
          reply = sink event
          unsubBoth() if reply == Bacon.noMore
          reply
      unsubLeft = left.subscribe(smartSink)
      unsubRight = right.subscribe(smartSink) unless unsubscribed
      unsubBoth

  toProperty: (initValue) ->
    initValue = Bacon.None if arguments.length == 0
    @scan(initValue, latter)

  scan: (seed, f) ->
    acc = toOption(seed)
    f = toCombinator(f)

    handleEvent = (event) ->
      acc = new Some(f(acc.getOrElse(undefined), event.value)) if event.hasValue()
      @push event.apply(acc.getOrElse(undefined))
    d = new Dispatcher(@subscribe, handleEvent)
    subscribe = (sink) ->
      reply = acc.map((val) -> sink initial(val)).getOrElse Bacon.more
      d.subscribe(sink) unless reply == Bacon.noMore
    new Property(subscribe)

  concat: (right) ->
    left = this
    new EventStream (sink) ->
      unsub = left.subscribe (e) ->
        if e.isEnd()
          unsub = right.subscribe sink
        else
          sink(e)
      -> unsub()

  startWith: (seed) ->
    Bacon.once(seed).concat(this)

  decorateWith: (label, property) ->
    property.sampledBy(this, (propertyValue, streamValue) ->
        result = cloneObject(streamValue)
        result[label] = propertyValue
        result
      )

  mapEnd : (f, args...) ->
    f = makeFunction(f, args)
    @withHandler (event) ->
      if (event.isEnd())
        @push next(f(event))
        @push end()
        Bacon.noMore
      else
        @push event

  withHandler: (handler) ->
    dispatcher = new Dispatcher(@subscribe, handler)
    new EventStream(dispatcher.subscribe)
  withSubscribe: (subscribe) -> new EventStream(subscribe)

class Property extends Observable
  constructor: (@subscribe) ->
    super()
    combine = (other, leftSink, rightSink) => 
      myVal = None
      otherVal = None
      new Property (sink) =>
        unsubscribed = false
        unsubMe = nop
        unsubOther = nop
        unsubBoth = -> unsubMe() ; unsubOther() ; unsubscribed = true
        myEnd = false
        otherEnd = false
        checkEnd = ->
          if myEnd and otherEnd
            reply = sink end()
            unsubBoth() if reply == Bacon.noMore
            reply
        initialSent = false
        combiningSink = (markEnd, setValue, thisSink) =>
          (event) =>
            if (event.isEnd())
              markEnd()
              checkEnd()
              Bacon.noMore
            else if event.isError()
                reply = sink event
                unsubBoth if reply == Bacon.noMore
                reply
            else
              setValue(new Some(event.value))
              if (myVal.isDefined and otherVal.isDefined)
                if initialSent and event.isInitial()
                  # don't send duplicate Initial
                  Bacon.more
                else
                  initialSent = true
                  reply = thisSink(sink, event, myVal.value, otherVal.value)
                  unsubBoth if reply == Bacon.noMore
                  reply
              else
                Bacon.more

        mySink = combiningSink (-> myEnd = true), ((value) -> myVal = value), leftSink
        otherSink = combiningSink (-> otherEnd = true), ((value) -> otherVal = value), rightSink
        unsubMe = this.subscribe mySink
        unsubOther = other.subscribe otherSink unless unsubscribed
        unsubBoth
    @combine = (other, f) =>
      combinator = toCombinator(f)
      combineAndPush = (sink, event, myVal, otherVal) -> sink(event.apply(combinator(myVal, otherVal)))
      combine(other, combineAndPush, combineAndPush)
    @sampledBy = (sampler, combinator = former) =>
      combinator = toCombinator(combinator)
      pushPropertyValue = (sink, event, propertyVal, streamVal) -> sink(event.apply(combinator(propertyVal, streamVal)))
      combine(sampler, nop, pushPropertyValue).changes().takeUntil(sampler.filter(false).mapEnd())
  sample: (interval) =>
    @sampledBy Bacon.interval(interval, {})
  changes: => new EventStream (sink) =>
    @subscribe (event) =>
      sink event unless event.isInitial()
  withHandler: (handler) ->
    new Property(new PropertyDispatcher(@subscribe, handler).subscribe)
  withSubscribe: (subscribe) -> new Property(new PropertyDispatcher(subscribe).subscribe)
  toProperty: => this
  and: (other) -> @combine(other, (x, y) -> x && y)
  or:  (other) -> @combine(other, (x, y) -> x || y)

class Dispatcher
  constructor: (subscribe, handleEvent) ->
    subscribe ?= -> nop
    sinks = []
    @hasSubscribers = -> sinks.length > 0
    unsubscribeFromSource = nop
    removeSink = (sink) ->
      remove(sink, sinks)
    @push = (event) =>
      waiters = undefined
      done = -> 
        if waiters?
          ws = waiters
          waiters = undefined
          w() for w in ws
        event.onDone = Event.prototype.onDone
      event.onDone = (listener) ->
        if waiters? and not contains(waiters, listener)
          waiters.push(listener)
        else
          waiters = [listener]
      assertEvent event
      for sink in (cloneArray(sinks))
        reply = sink event
        removeSink sink if reply == Bacon.noMore or event.isEnd()
      done()
      if @hasSubscribers() then Bacon.more else Bacon.noMore
    handleEvent ?= (event) -> @push event
    @handleEvent = (event) => 
      assertEvent event
      if event.isEnd()
        subscribe = => nop
      handleEvent.apply(this, [event])
    @subscribe = (sink) =>
      assertFunction sink
      sinks.push(sink)
      if sinks.length == 1
        unsubscribeFromSource = subscribe @handleEvent
      assertFunction unsubscribeFromSource
      =>
        removeSink sink
        unsubscribeFromSource() unless @hasSubscribers()

class PropertyDispatcher extends Dispatcher
  constructor: (subscribe, handleEvent) ->
    super(subscribe, handleEvent)
    current = Bacon.None
    push = @push
    subscribe = @subscribe
    @push = (event) =>
      if event.hasValue()
        current = new Some(event.value)
      push.apply(this, [event])
    @subscribe = (sink) =>
      reply = current.filter(@hasSubscribers).map((val) -> sink initial(val))
      if reply.getOrElse(Bacon.more) == Bacon.noMore
        nop
      else
        subscribe.apply(this, [sink])

class Bus extends EventStream
  constructor: ->
    sink = undefined
    unsubFuncs = []
    inputs = []
    ended = false
    guardedSink = (input) => (event) =>
      if (event.isEnd())
        remove(input, inputs)
        Bacon.noMore
      else
        sink event
    unsubAll = => 
      f() for f in unsubFuncs
      unsubFuncs = []
    subscribeAll = (newSink) =>
      sink = newSink
      unsubFuncs = []
      for input in cloneArray(inputs)
        unsubFuncs.push(input.subscribe(guardedSink(input)))
      unsubAll
    dispatcher = new Dispatcher(subscribeAll)
    subscribeThis = (sink) =>
      dispatcher.subscribe(sink)
    super(subscribeThis)
    @plug = (inputStream) =>
      return if ended
      inputs.push(inputStream)
      if (sink?)
        unsubFuncs.push(inputStream.subscribe(guardedSink(inputStream)))
    @push = (value) =>
      sink next(value) if sink?
    @error = (error) =>
      sink new Error(error) if sink?
    @end = =>
      ended = true
      unsubAll()
      sink end() if sink?

class Some
  constructor: (@value) ->
  getOrElse: -> @value
  filter: (f) ->
    if f @value
      new Some(@value)
    else
      None
  map: (f) ->
    new Some(f @value)
  isDefined: true

None =
  getOrElse: (value) -> value
  filter: -> None
  map: -> None
  isDefined: false

Bacon.EventStream = EventStream
Bacon.Property = Property
Bacon.Observable = Observable
Bacon.Bus = Bus
Bacon.Initial = Initial
Bacon.Next = Next
Bacon.End = End
Bacon.Error = Error
Bacon.None = None
Bacon.Some = Some

nop = ->
latter = (_, x) -> x
former = (x, _) -> x
initial = (value) -> new Initial(value)
next = (value) -> new Next(value)
end = -> new End()
isEvent = (x) -> x? and x.isEvent? and x.isEvent()
toEvent = (x) -> 
  if isEvent x
    x
  else
    next x
empty = (xs) -> xs.length == 0
head = (xs) -> xs[0]
tail = (xs) -> xs[1...xs.length]
filter = (f, xs) ->
  filtered = []
  for x in xs
    filtered.push(x) if f(x)
  filtered
map = (f, xs) ->
  f(x) for x in xs
cloneArray = (xs) -> xs.slice(0)
cloneObject = (src) ->
  clone = {}
  for key, value of src
    clone[key] = value
  clone
remove = (x, xs) ->
  i = xs.indexOf(x)
  if i >= 0
    xs.splice(i, 1)
contains = (xs, x) -> xs.indexOf(x) >= 0
assert = (message, condition) -> throw message unless condition
assertEvent = (event) -> assert "not an event : " + event, event.isEvent? ; assert "not event", event.isEvent()
assertFunction = (f) -> assert "not a function : " + f, isFunction(f)
isFunction = (f) -> typeof f == "function"
assertArray = (xs) -> assert "not an array : " + xs, xs instanceof Array
assertString = (x) -> assert "not a string : " + x, typeof x == "string"
always = (x) -> (-> x)
methodCall = (obj, method, args) ->
  assertString(method)
  if args == undefined then args = []
  (value) -> obj[method]((args.concat([value]))...)
partiallyApplied = (f, args) ->
  (value) -> f((args.concat([value]))...)
makeFunction = (f, args) ->
  if isFunction f
    if args.length then partiallyApplied(f, args) else f
  else if isFieldKey(f) 
    key = toFieldKey(f)
    (value) ->
      fieldValue = value[key]
      if isFunction(fieldValue)
        value[key](args...)
      else
        fieldValue
  else if typeof f == "object" and args.length
    methodCall(f, head(args), tail(args))
  else
    always f
isFieldKey = (f) ->
  (typeof f == "string") and f.length > 1 and f[0] == "."
toFieldKey = (f) ->
  f.slice(1)
toCombinator = (f) ->
  if isFunction f
    f
  else if isFieldKey f
    key = toFieldKey(f)
    (left, right) ->
      left[key](right)
  else
    assert "not a function or a field key: " + f, false
toOption = (v) ->
  if v instanceof Some || v == None
    v
  else
    new Some(v)

if define? and define.amd? then define? -> Bacon
