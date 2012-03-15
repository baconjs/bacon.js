(this.jQuery || this.Zepto)?.fn.asEventStream = (eventName) ->
  element = this
  new EventStream (sink) ->
    handler = (event) ->
      reply = sink (next event)
      if (reply == Bacon.noMore)
        unbind()
    unbind = -> element.unbind(eventName, handler)
    element.bind(eventName, handler)
    unbind

Bacon = @Bacon = {
  taste : "delicious"
}

Bacon.noMore = "veggies"

Bacon.more = "moar bacon!"

Bacon.never = => new EventStream (sink) =>
  => nop

Bacon.later = (delay, value) ->
  Bacon.sequentially(delay, [value])

Bacon.sequentially = (delay, values) ->
  Bacon.repeatedly(delay, values).take(values.length)

Bacon.repeatedly = (delay, values) ->
  index = -1
  poll = ->
    index++
    next values[index % values.length]
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

Bacon.interval = (delay, value) ->
  value = {} unless value?
  poll = -> next(value)
  Bacon.fromPoll(delay, poll)

Bacon.pushStream = ->
  d = new Dispatcher
  pushStream = d.toEventStream()
  pushStream.push = (value) -> d.push next(value)
  pushStream.end = -> d.push end()
  pushStream

Bacon.constant = (value) ->
  new Property (sink) ->
    sink(initial(value))
    sink(end())

Bacon.combineAll = (streams, f) ->
  assertArray streams
  stream = head streams
  for next in (tail streams)
    stream = f(stream, next)
  stream

Bacon.mergeAll = (streams) ->
  Bacon.combineAll(streams, (s1, s2) -> s1.merge(s2))

Bacon.combineAsArray = (streams) ->
  toArray = (x) -> if x? then (if (x instanceof Array) then x else [x]) else []
  concatArrays = (a1, a2) -> toArray(a1).concat(toArray(a2))
  Bacon.combineAll(streams, (s1, s2) ->
    s1.toProperty().combine(s2, concatArrays))

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
  hasValue: -> false

class Next extends Event
  constructor: (@value) ->
  isNext: -> true
  hasValue: -> true
  fmap: (f) -> next(f(this.value))
  apply: (value) -> next(value)

class Initial extends Next
  isInitial: -> true
  isNext: -> false
  fmap: (f) -> initial(f(this.value))
  apply: (value) -> initial(value)

class End extends Event
  constructor: ->
  isEnd: -> true
  fmap: -> this
  apply: -> this

class Observable
  onValue: (f) -> @subscribe (event) ->
    f event.value if event.hasValue()

class EventStream extends Observable
  constructor: (subscribe) ->
    assertFunction subscribe
    dispatcher = new Dispatcher(subscribe)
    @subscribe = dispatcher.subscribe
    @hasSubscribers = dispatcher.hasSubscribers
  filter: (f) ->
    @withHandler (event) -> 
      if event.isEnd() or f event.value
        @push event
      else
        Bacon.more
  takeWhile: (f) ->
    @withHandler (event) -> 
      if event.isEnd() or f event.value
        @push event
      else
        @push end()
        Bacon.noMore
  take: (count) ->
    assert "take: count must >= 1", (count>=1)
    @withHandler (event) ->
      if event.isEnd()
        @push event
      else if (count == 1)
        @push event
        @push end()
        Bacon.noMore
      else
        count--
        @push event
  skip : (count) ->
    assert "skip: count must >= 0", (count>=0)
    @withHandler (event) ->
      if event.isEnd()
        @push event
      else if (count > 0)
        count--
        Bacon.more
      else
        @push event

  map: (f) ->
    @withHandler (event) -> 
      @push event.fmap(f)
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
        else
          child = f event.value
          unsubChild = undefined
          removeChild = ->
            remove(unsubChild, children) if unsubChild?
            checkEnd()
          handler = (event) ->
            if event.isEnd()
              removeChild()
              Bacon.noMore
            else
              reply = sink event
              if reply == Bacon.noMore
                unbind()
              reply
          unsubChild = child.subscribe handler
          children.push unsubChild
      unsubRoot = root.subscribe(spawner)
      unbind
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
        @push next(values)
        values = []
      if (event.isEnd())
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
      unsubBoth = -> unsubLeft() ; unsubRight()
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
      unsubRight = right.subscribe(smartSink)
      unsubBoth

  takeUntil: (stopper) ->
    src = this
    new EventStream (sink) ->
      unsubSrc = nop
      unsubStopper = nop
      unsubBoth = -> unsubSrc() ; unsubStopper()
      srcSink = (event) ->
        if event.isEnd()
          unsubStopper()
        reply = sink event
        if reply == Bacon.noMore
          unsubStopper()
        reply
      stopperSink = (event) ->
        unless event.isEnd()
          unsubSrc()
          sink end()
        Bacon.noMore
      unsubSrc = src.subscribe(srcSink)
      unsubStopper = stopper.subscribe(stopperSink)
      unsubBoth

  toProperty: (initValue) ->
   @scan(initValue, latter)

  scan: (seed, f) -> 
    acc = seed
    handleEvent = (event) -> 
      acc = f(acc, event.value) unless event.isEnd()
      @push event.apply(acc)
    d = new Dispatcher(@subscribe, handleEvent)
    subscribe = (sink) ->
      sink initial(acc) if acc?
      d.subscribe(sink)
    new Property(subscribe)

  distinctUntilChanged: ->
    @withStateMachine undefined, (prev, event) ->
      if event.isEnd() or prev isnt event.value
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

  decorateWith: (label, property) ->
    property.sampledBy(this, (propertyValue, streamValue) ->
        result = cloneObject(streamValue)
        result[label] = propertyValue
        result
      )

  end: (value = "end") ->
    @withHandler (event) ->
      if event.isEnd()
        @push next(value)
        @push end()
        Bacon.noMore
      else
        Bacon.more

  withHandler: (handler) ->
    new Dispatcher(@subscribe, handler).toEventStream()
  toString: -> "EventStream"

class Property extends Observable
  constructor: (@subscribe) ->
    combine = (other, leftSink, rightSink) => 
      myVal = undefined
      otherVal = undefined
      new Property (sink) =>
        unsubMe = nop
        unsubOther = nop
        unsubBoth = -> unsubMe() ; unsubOther()
        myEnd = false
        otherEnd = false
        checkEnd = ->
          if myEnd and otherEnd
            sink end()
        combiningSink = (markEnd, setValue, thisSink) =>
          (event) =>
            if (event.isEnd())
              markEnd()
              checkEnd()
              Bacon.noMore
            else
              setValue(event.value)
              if (myVal? and otherVal?)
                reply = thisSink(sink, event, myVal, otherVal)
                unsubBoth if reply == Bacon.noMore
                reply
              else
                Bacon.more

        mySink = combiningSink (-> myEnd = true), ((value) -> myVal = value), leftSink
        otherSink = combiningSink (-> otherEnd = true), ((value) -> otherVal = value), rightSink
        unsubMe = this.subscribe mySink
        unsubOther = other.subscribe otherSink
        unsubBoth
    @combine = (other, combinator) =>
      combineAndPush = (sink, event, myVal, otherVal) -> sink(event.apply(combinator(myVal, otherVal)))
      combine(other, combineAndPush, combineAndPush)
    @sampledBy = (sampler, combinator = former) =>
      pushPropertyValue = (sink, event, propertyVal, streamVal) -> sink(event.apply(combinator(propertyVal, streamVal)))
      combine(sampler, nop, pushPropertyValue).changes().takeUntil(sampler.end())
  sample: (interval) =>
    @sampledBy Bacon.interval(interval, {})
  map: (f) => new Property (sink) =>
    @subscribe (event) => sink(event.fmap(f))
  filter: (f) => new Property (sink) =>
    @subscribe (event) =>
      if event.isEnd() or f(event.value)
        sink(event)
      else
        Bacon.more
  takeUntil: (stopper) => @sampledBy(@changes().takeUntil(stopper))
  changes: => new EventStream (sink) =>
    @subscribe (event) =>
      sink event unless event.isInitial()
  toProperty: => this

class Dispatcher
  constructor: (subscribe, handleEvent) ->
    subscribe ?= -> nop
    sinks = []
    @hasSubscribers = -> sinks.length > 0
    unsubscribeFromSource = nop
    removeSink = (sink) ->
      remove(sink, sinks)
    @push = (event) =>
      assertEvent event
      for sink in (cloneArray(sinks))
        reply = sink event
        removeSink sink if reply == Bacon.noMore or event.isEnd()
      if @hasSubscribers() then Bacon.more else Bacon.noMore
    handleEvent ?= (event) -> @push event
    @handleEvent = (event) => 
      assertEvent event
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
  toEventStream: -> new EventStream(@subscribe)
  toString: -> "Dispatcher"

class Bus extends EventStream
  constructor: ->
    sink = undefined
    unsubFuncs = []
    inputs = []
    guardedSink = (event) =>
      if (event.isEnd())
        Bacon.noMore
      else
        sink event
    subscribeAll = (newSink) =>
      sink = newSink
      unsubFuncs = []
      for input in inputs
        unsubFuncs.push(input.subscribe(guardedSink))
      unsubAll = => f() for f in unsubFuncs
      unsubAll
    dispatcher = new Dispatcher(subscribeAll)
    subscribeThis = (sink) =>
      dispatcher.subscribe(sink)
    super(subscribeThis)
    @plug = (inputStream) =>
      inputs.push(inputStream)
      if (sink?)
        unsubFuncs.push(inputStream.subscribe(guardedSink))
    @push = (value) =>
      sink next(value)
    @end = =>
      sink end()

# TODO: Bus should clean up inputs when they end

Bacon.EventStream = EventStream
Bacon.Property = Property
Bacon.Bus = Bus
Bacon.Initial = Initial
Bacon.Next = Next
Bacon.End = End

nop = ->
latter = (_, x) -> x
former = (x, _) -> x
initial = (value) -> new Initial(value)
next = (value) -> new Next(value)
end = -> new End()
empty = (xs) -> xs.length == 0
head = (xs) -> xs[0]
tail = (xs) -> xs[1...xs.length]
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
assert = (message, condition) ->
  unless condition
    throw message
assertEvent = (event) -> 
  assert "not an event : " + event, event.isEvent?
  assert "not event", event.isEvent()
assertFunction = (f) ->
  assert "not a function : " + f, typeof f == "function"
assertArray = (xs) ->
  assert "not an array : " + xs, xs instanceof Array
