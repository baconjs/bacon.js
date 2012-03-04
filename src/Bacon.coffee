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

Bacon.later = (delay, value) ->
  new EventStream ((sink) ->
      push = -> 
        sink next(value)
        sink end()
      setTimeout push delay
      nop
  )

Bacon.sequentially = (delay, values) ->
  new EventStream ((sink) ->
      schedule = (xs) -> 
        if empty xs
          sink end()
        else
          setTimeout (-> push xs), delay
      push = (xs) -> 
        reply = sink (next(head xs))
        unless reply == Bacon.noMore
          schedule (tail xs)
      schedule values
      nop
  )

Bacon.interval = (delay, value) ->
  value = {} unless value?
  new EventStream (sink) ->
    id = undefined
    handler = ->
      reply = sink (next value)
      if (reply == Bacon.noMore)
        unbind()
    unbind = -> 
      clearInterval id
    id = setInterval(handler, delay)
    unbind

Bacon.pushStream = ->
  d = new Dispatcher
  pushStream = d.toEventStream()
  pushStream.push = (event) -> d.push next(event)
  pushStream.end = -> d.push end()
  pushStream

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

class Initial extends Next
  isInitial: -> true

class End extends Event
  constructor: ->
  isEnd: -> true

class EventStream
  constructor: (subscribe) ->
    dispatcher = new Dispatcher(subscribe)
    @subscribe = dispatcher.subscribe
    @hasSubscribers = dispatcher.hasSubscribers
  onValue: (f) -> @subscribe (event) ->
    f event.value if event.hasValue()
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
    @withHandler (event) ->
      if event.isEnd() or count > 0
        count--
        @push event
      else
        @push end()
        Bacon.noMore
  map: (f) ->
    @withHandler (event) -> 
      if event.isEnd()
        @push event
      else
        @push next(f event.value)
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

  toProperty: (initValue) ->
    new Property(this, initValue)

  withHandler: (handler) ->
    new Dispatcher(@subscribe, handler).toEventStream()
  toString: -> "EventStream"

class Property
  constructor: (stream, initValue) ->
    currentValue = initValue
    handleEvent = (event) -> 
      currentValue = event.value unless event.isEnd
      @push event
    d = new Dispatcher(stream.subscribe, handleEvent)
    @subscribe = (sink) ->
      sink initial(currentValue) if currentValue?
      d.subscribe(sink)

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
      for sink in sinks
        reply = sink event
        removeSink sink if reply == Bacon.noMore or event.isEnd()
      if @hasSubscribers() then Bacon.more else Bacon.noMore
    handleEvent ?= (event) -> @push event
    @handleEvent = (event) => 
      assertEvent event
      handleEvent.apply(this, [event])
    @subscribe = (sink) =>
      sinks.push(sink)
      if sinks.length == 1
        unsubscribeFromSource = subscribe @handleEvent
      assertFunction unsubscribeFromSource
      =>
        removeSink sink
        unsubscribeFromSource() unless @hasSubscribers()
  toEventStream: -> new EventStream(@subscribe)
  toString: -> "Dispatcher"

Bacon.EventStream = EventStream
Bacon.Property = Property
Bacon.Initial = Initial
Bacon.Next = Next
Bacon.End = End

nop = ->
initial = (value) -> new Initial(value)
next = (value) -> new Next(value)
end = -> new End()
empty = (xs) -> xs.length == 0
head = (xs) -> xs[0]
tail = (xs) -> xs[1...xs.length]
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
