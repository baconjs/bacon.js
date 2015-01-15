# build-dependencies: _
# build-dependencies: scheduler
# build-dependencies: functionconstruction
# build-dependencies: updatebarrier
# build-dependencies: event
# build-dependencies: factories
# build-dependencies: when
# build-dependencies: describe

registerObs = ->

Bacon.noMore = ["<no-more>"]
Bacon.more = ["<more>"]

Bacon.groupSimultaneous = (streams...) ->
  if (streams.length == 1 and isArray(streams[0]))
    streams = streams[0]
  sources = for s in streams
    new BufferingSource(s)
  withDescription(Bacon, "groupSimultaneous", streams..., Bacon.when(sources, ((xs...) -> xs)))

idCounter = 0

class Observable
  constructor: (desc) ->
    @id = ++idCounter
    withDescription(desc, this)
    @initialDesc = @desc
  
  subscribe: (sink) ->
    UpdateBarrier.wrappedSubscribe(this, sink)

  subscribeInternal: (sink) ->
    # For backward compatibility. To be removed in 0.8
    @dispatcher.subscribe(sink)

  onValue: ->
    f = makeFunctionArgs(arguments)
    @subscribe (event) ->
      f event.value() if event.hasValue()

  onValues: (f) ->
    @onValue (args) -> f(args...)

  onError: ->
    f = makeFunctionArgs(arguments)
    @subscribe (event) ->
      f event.error if event.isError()

  onEnd: ->
    f = makeFunctionArgs(arguments)
    @subscribe (event) ->
      f() if event.isEnd()

  errors: -> withDescription(this, "errors", @filter(-> false))

  filter: (f, args...) ->
    convertArgsToFunction this, f, args, (f) ->
      withDescription(this, "filter", f, @withHandler (event) ->
        if event.filter(f)
          @push event
        else
          Bacon.more)

  takeWhile: (f, args...) ->
    convertArgsToFunction this, f, args, (f) ->
      withDescription(this, "takeWhile", f, @withHandler (event) ->
        if event.filter(f)
          @push event
        else
          @push end()
          Bacon.noMore)

  endOnError: (f, args...) ->
    f = true unless f?
    convertArgsToFunction this, f, args, (f) ->
      withDescription(this, "endOnError", @withHandler (event) ->
        if event.isError() and f(event.error)
          @push event
          @push end()
        else
          @push event)

  take: (count) ->
    return Bacon.never() if count <= 0
    withDescription(this, "take", count, @withHandler (event) ->
      unless event.hasValue()
        @push event
      else
        count--
        if count > 0
          @push event
        else
          @push event if count == 0
          @push end()
          Bacon.noMore)

  map: (p, args...) ->
    convertArgsToFunction this, p, args, (f) ->
      withDescription(this, "map", f, @withHandler (event) ->
        @push event.fmap(f))

  mapError: ->
    f = makeFunctionArgs(arguments)
    withDescription(this, "mapError", f, @withHandler (event) ->
      if event.isError()
        @push next (f event.error)
      else
        @push event)

  mapEnd: ->
    f = makeFunctionArgs(arguments)
    withDescription(this, "mapEnd", f, @withHandler (event) ->
      if (event.isEnd())
        @push next(f(event))
        @push end()
        Bacon.noMore
      else
        @push event)

  doAction: ->
    f = makeFunctionArgs(arguments)
    withDescription(this, "doAction", f, @withHandler (event) ->
      f(event.value()) if event.hasValue()
      @push event)

  skip: (count) ->
    withDescription(this, "skip", count, @withHandler (event) ->
      unless event.hasValue()
        @push event
      else if (count > 0)
        count--
        Bacon.more
      else
        @push event)

  skipDuplicates: (isEqual = (a, b) -> a == b) ->
    withDescription(this, "skipDuplicates",
      @withStateMachine None, (prev, event) ->
        unless event.hasValue()
          [prev, [event]]
        else if event.isInitial() or prev == None or !isEqual(prev.get(), event.value())
          [new Some(event.value()), [event]]
        else
          [prev, []])

  skipErrors: ->
    withDescription(this, "skipErrors", @withHandler (event) ->
      if event.isError()
        Bacon.more
      else
        @push event)

  withStateMachine: (initState, f) ->
    state = initState
    withDescription(this, "withStateMachine", initState, f, @withHandler (event) ->
      fromF = f(state, event)
      [newState, outputs] = fromF
      state = newState
      reply = Bacon.more
      for output in outputs
        reply = @push output
        if reply == Bacon.noMore
          return reply
      reply)

  scan: (seed, f) ->
    f = toCombinator(f)
    acc = toOption(seed)
    subscribe = (sink) =>
      initSent = false
      unsub = nop
      reply = Bacon.more
      sendInit = ->
        unless initSent
          acc.forEach (value) ->
            initSent = true
            reply = sink(new Initial(-> value))
            if (reply == Bacon.noMore)
              unsub()
              unsub = nop
      unsub = @dispatcher.subscribe (event) ->
        if (event.hasValue())
          if (initSent and event.isInitial())
            Bacon.more # init already sent, skip this one
          else
            sendInit() unless event.isInitial()
            initSent = true
            prev = acc.getOrElse(undefined)
            next = f(prev, event.value())
            acc = new Some(next)
            sink (event.apply(-> next))
        else
          if event.isEnd()
            reply = sendInit()
          sink event unless reply == Bacon.noMore
      UpdateBarrier.whenDoneWith resultProperty, sendInit
      unsub
    resultProperty = new Property describe(this, "scan", seed, f), subscribe

  diff: (start, f) ->
    f = toCombinator(f)
    withDescription(this, "diff", start, f,
      @scan([start], (prevTuple, next) ->
        [next, f(prevTuple[0], next)])
      .filter((tuple) -> tuple.length == 2)
      .map((tuple) -> tuple[1]))

  not: -> withDescription(this, "not", @map((x) -> !x))

  log: (args...) ->
    @subscribe (event) -> console?.log?(args..., event.log())
    this

  slidingWindow: (n, minValues = 0) ->
    withDescription(this, "slidingWindow", n, minValues, @scan([], ((window, value) -> window.concat([value]).slice(-n)))
          .filter(((values) -> values.length >= minValues)))

  awaiting: (other) ->
    withDescription(this, "awaiting", other,
      Bacon.groupSimultaneous(this, other)
        .map(([myValues, otherValues]) -> otherValues.length == 0)
        .toProperty(false).skipDuplicates())

  name: (name) ->
    @_name = name
    this

  withDescription: ->
    describe(arguments...).apply(this)

  toString: ->
    if @_name
      @_name
    else
      @desc.toString()

  internalDeps: ->
    @initialDesc.deps()

Observable :: reduce = Observable :: fold
Observable :: assign = Observable :: onValue
Observable :: inspect = Observable :: toString

class EventStream extends Observable
  constructor: (desc, subscribe, handler) ->
    if _.isFunction(desc)
      handler = subscribe
      subscribe = desc
      desc = []
    super(desc)
    assertFunction subscribe
    @dispatcher = new Dispatcher(subscribe, handler)
    registerObs(this)

  throttle: (delay) ->
    withDescription(this, "throttle", delay, @bufferWithTime(delay).map((values) -> values[values.length - 1]))

  bufferWithTime: (delay) ->
    withDescription(this, "bufferWithTime", delay, @bufferWithTimeOrCount(delay, Number.MAX_VALUE))

  bufferWithCount: (count) ->
    withDescription(this, "bufferWithCount", count, @bufferWithTimeOrCount(undefined, count))

  bufferWithTimeOrCount: (delay, count) ->
    flushOrSchedule = (buffer) ->
      if buffer.values.length == count
        buffer.flush()
      else if (delay != undefined)
        buffer.schedule()
    withDescription(this, "bufferWithTimeOrCount", delay, count, @buffer(delay, flushOrSchedule, flushOrSchedule))

  buffer: (delay, onInput = nop, onFlush = nop) ->
    buffer = {
      scheduled: false
      end: undefined
      values: []
      flush: ->
        @scheduled = false
        if @values.length > 0
          reply = @push next(@values)
          @values = []
          if @end?
            @push @end
          else if reply != Bacon.noMore
            onFlush(this)
        else
          @push @end if @end?
      schedule: ->
        unless @scheduled
          @scheduled = true
          delay(=> @flush())
    }
    reply = Bacon.more
    unless _.isFunction(delay)
      delayMs = delay
      delay = (f) -> Bacon.scheduler.setTimeout(f, delayMs)
    withDescription(this, "buffer", @withHandler (event) ->
      buffer.push = (event) => @push(event)
      if event.isError()
        reply = @push event
      else if event.isEnd()
        buffer.end = event
        unless buffer.scheduled
          buffer.flush()
      else
        buffer.values.push(event.value())
        onInput(buffer)
      reply)

  toProperty: (initValue_) ->
    initValue = if arguments.length == 0 then None else toOption(-> initValue_)
    disp = @dispatcher
    new Property(describe(this, "toProperty", initValue_),
      (sink) ->
        initSent = false
        unsub = nop
        reply = Bacon.more
        sendInit = ->
          unless initSent
            initValue.forEach (value) ->
              initSent = true
              reply = sink (new Initial(value))
              if reply == Bacon.noMore
                unsub()
                unsub = nop
        unsub = disp.subscribe (event) ->
          if event.hasValue()
            if (initSent and event.isInitial())
              Bacon.more
            else
              sendInit() unless event.isInitial()
              initSent = true
              initValue = new Some(event)
              sink event
          else
            if event.isEnd()
              reply = sendInit()
            sink event unless reply == Bacon.noMore
        sendInit()
        unsub
    )

  toEventStream: -> this

  concat: (right) ->
    left = this
    new EventStream describe(left, "concat", right), (sink) ->
      unsubRight = nop
      unsubLeft = left.dispatcher.subscribe (e) ->
        if e.isEnd()
          unsubRight = right.dispatcher.subscribe sink
        else
          sink(e)
      -> unsubLeft() ; unsubRight()

  takeUntil: (stopper) ->
    endMarker = {}
    withDescription(this, "takeUntil", stopper, Bacon.groupSimultaneous(@mapEnd(endMarker), stopper.skipErrors())
      .withHandler((event) ->
        unless event.hasValue()
          @push event
        else
          [data, stopper] = event.value()
          if stopper.length
#            console.log(_.toString(data), "stopped by", _.toString(stopper))
            @push end()
          else
            reply = Bacon.more
            for value in data
              if value == endMarker
                reply = @push end()
              else
                reply = @push next(value)
            reply
      ))

  skipUntil: (starter) ->
    started = starter.take(1).map(true).toProperty(false)
    withDescription(this, "skipUntil", starter, @filter(started))

  skipWhile: (f, args...) ->
    ok = false
    convertArgsToFunction this, f, args, (f) ->
      withDescription(this, "skipWhile", f, @withHandler (event) ->
        if ok or !event.hasValue() or !f(event.value())
          ok = true if event.hasValue()
          @push event
        else
          Bacon.more)


  startWith: (seed) ->
    withDescription(this, "startWith", seed,
      Bacon.once(seed).concat(this))

  withHandler: (handler) ->
    new EventStream describe(this, "withHandler", handler), @dispatcher.subscribe, handler

class Property extends Observable
  constructor: (desc, subscribe, handler) ->
    if _.isFunction(desc)
      handler = subscribe
      subscribe = desc
      desc = []
    super(desc)
    assertFunction(subscribe)
    @dispatcher = new PropertyDispatcher(this, subscribe, handler)
    registerObs(this)

  changes: -> new EventStream describe(this, "changes"), (sink) =>
    @dispatcher.subscribe (event) ->
      #console.log "CHANGES", event.toString()
      sink event unless event.isInitial()

  withHandler: (handler) ->
    new Property describe(this, "withHandler", handler), @dispatcher.subscribe, handler

  toProperty: ->
    assertNoArguments(arguments)
    this

  toEventStream: ->
    new EventStream describe(this, "toEventStream"), (sink) =>
      @dispatcher.subscribe (event) ->
        event = event.toNext() if event.isInitial()
        sink event

  delay: (delay) -> @delayChanges("delay", delay, (changes) -> changes.delay(delay))

  debounce: (delay) -> @delayChanges("debounce", delay, (changes) -> changes.debounce(delay))

  throttle: (delay) -> @delayChanges("throttle", delay, (changes) -> changes.throttle(delay))

  delayChanges: (desc..., f) ->
    withDescription(this, desc...,
      addPropertyInitValueToStream(this, f(@changes())))

  takeUntil: (stopper) ->
    changes = @changes().takeUntil(stopper)
    withDescription(this, "takeUntil", stopper,
      addPropertyInitValueToStream(this, changes))

  startWith: (value) ->
    withDescription(this, "startWith", value,
      @scan(value, (prev, next) -> next))
  
  bufferingThrottle: ->
    super.bufferingThrottle(arguments...).toProperty()

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
      sink end()
    unsub
  justInitValue.concat(stream).toProperty()

class Dispatcher
  constructor: (@_subscribe, @_handleEvent) ->
    @subscriptions = []
    @queue = []
    @pushing = false
    @ended = false
    @prevError = undefined
    @unsubSrc = undefined

  hasSubscribers: ->
    @subscriptions.length > 0

  removeSub: (subscription) ->
    @subscriptions = _.without(subscription, @subscriptions)

  push: (event) ->
    if event.isEnd()
      @ended = true
    UpdateBarrier.inTransaction event, this, @pushIt, [event]

  pushToSubscriptions: (event) ->
    try
      tmp = @subscriptions
      for sub in tmp
        reply = sub.sink event
        @removeSub sub if reply == Bacon.noMore or event.isEnd()
      true
    catch e
      @pushing = false
      @queue = [] # ditch queue in case of exception to avoid unexpected behavior
      throw e

  pushIt: (event) ->
    unless @pushing
      return if event == @prevError
      @prevError = event if event.isError()
      @pushing = true
      @pushToSubscriptions(event)
      @pushing = false
      while @queue.length
        event = @queue.shift()
        @push event
      if @hasSubscribers()
        Bacon.more
      else
        @unsubscribeFromSource()
        Bacon.noMore
    else
      @queue.push(event)
      Bacon.more

  handleEvent: (event) =>
    if @_handleEvent
      @_handleEvent(event)
    else
      @push event

  unsubscribeFromSource: ->
    @unsubSrc() if @unsubSrc
    @unsubSrc = undefined

  subscribe: (sink) =>
    if @ended
      sink end()
      nop
    else
      assertFunction sink
      subscription = { sink: sink }
      @subscriptions.push(subscription)
      if @subscriptions.length == 1
        @unsubSrc = @_subscribe @handleEvent
        assertFunction @unsubSrc
      =>
        @removeSub subscription
        @unsubscribeFromSource() unless @hasSubscribers()

class PropertyDispatcher extends Dispatcher
  constructor: (@property, subscribe, handleEvent) ->
    super(subscribe, handleEvent)
    @current = None
    @currentValueRootId = undefined
    @propertyEnded = false

  push: (event) ->
    if event.isEnd()
      @propertyEnded = true
    if event.hasValue()
      @current = new Some(event)
      @currentValueRootId = UpdateBarrier.currentEventId()
    super(event)

  maybeSubSource: (sink, reply) ->
    if reply == Bacon.noMore
      nop
    else if @propertyEnded
      sink end()
      nop
    else
      Dispatcher::subscribe.call(this, sink)

  subscribe: (sink) =>
    initSent = false
    # init value is "bounced" here because the base Dispatcher class
    # won't add more than one subscription to the underlying observable.
    # without bouncing, the init value would be missing from all new subscribers
    # after the first one
    reply = Bacon.more

    if @current.isDefined and (@hasSubscribers() or @propertyEnded)
      # should bounce init value
      dispatchingId = UpdateBarrier.currentEventId()
      valId = @currentValueRootId
      if !@propertyEnded and valId and dispatchingId and dispatchingId != valId
        # when subscribing while already dispatching a value and this property hasn't been updated yet
        # we cannot bounce before this property is up to date.
        #console.log "bouncing with possibly stale value", event.value(), "root at", valId, "vs", dispatchingId
        UpdateBarrier.whenDoneWith @property, =>
          if @currentValueRootId == valId
            sink initial(@current.get().value())
        # the subscribing thing should be defered
        @maybeSubSource(sink, reply)
      else
        #console.log "bouncing value immediately"
        UpdateBarrier.inTransaction(undefined, this, (->
          reply = sink initial(@current.get().value())
        ), [])
        @maybeSubSource(sink, reply)
    else
      @maybeSubSource(sink, reply)

class Source
  constructor: (@obs, @sync, @lazy = false) ->
    @queue = []
  subscribe: (sink) -> @obs.dispatcher.subscribe(sink)
  toString: -> @obs.toString()
  markEnded: -> @ended = true
  consume: ->
    if @lazy
      { value: _.always(@queue[0]) }
    else
      @queue[0]
  push: (x) -> @queue = [x]
  mayHave: -> true
  hasAtLeast: -> @queue.length
  flatten: true

class ConsumingSource extends Source
  consume: -> @queue.shift()
  push: (x) -> @queue.push(x)
  mayHave: (c) -> !@ended or @queue.length >= c
  hasAtLeast: (c) -> @queue.length >= c
  flatten: false

class BufferingSource extends Source
  constructor: (obs) ->
    super(obs, true)
  consume: ->
    values = @queue
    @queue = []
    {value: -> values}
  push: (x) -> @queue.push(x.value())
  hasAtLeast: -> true

Source.isTrigger = (s) ->
  if s instanceof Source
    s.sync
  else
    s instanceof EventStream

Source.fromObservable = (s) ->
  if s instanceof Source
    s
  else if s instanceof Property
    new Source(s, false)
  else
    new ConsumingSource(s, true)

class Some
  constructor: (@value) ->
  getOrElse: -> @value
  get: -> @value
  filter: (f) ->
    if f @value
      new Some(@value)
    else
      None
  map: (f) ->
    new Some(f @value)
  forEach: (f) ->
    f @value
  isDefined: true
  toArray: -> [@value]
  inspect: -> "Some(" + @value + ")"
  toString: -> @inspect()

None = {
  getOrElse: (value) -> value
  filter: -> None
  map: -> None
  forEach: ->
  isDefined: false
  toArray: -> []
  inspect: -> "None"
  toString: -> @inspect()
}

Bacon.EventStream = EventStream
Bacon.Property = Property
Bacon.Observable = Observable

nop = ->
latter = (_, x) -> x
former = (x, _) -> x
initial = (value) -> new Initial(value, true)
next = (value) -> new Next(value, true)
end = -> new End()
# instanceof more performant than x.?isEvent?()
toEvent = (x) -> if x instanceof Event then x else next x
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

toOption = (v) ->
  if v instanceof Some or v == None
    v
  else
    new Some(v)
