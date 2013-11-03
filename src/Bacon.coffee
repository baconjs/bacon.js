Bacon = {}

# eventTransformer - should return one value or one or many events
Bacon.fromBinder = (binder, eventTransformer = _.id) ->
  new EventStream (sink) ->
    unbinder = binder (args...) ->
      value = eventTransformer(args...)
      unless value instanceof Array and _.last(value) instanceof Event
        value = [value]

      reply = Bacon.more
      for event in value
        reply = sink(event = toEvent(event))
        if reply == Bacon.noMore or event.isEnd()
          # defer if binder calls handler in sync before returning unbinder
          if unbinder? then unbinder() else Bacon.scheduler.setTimeout (-> unbinder()), 0
          return reply
      reply

# eventTransformer - defaults to returning the first argument to handler
Bacon.$ = asEventStream: (eventName, selector, eventTransformer) ->
  [eventTransformer, selector] = [selector, null] if isFunction(selector)
  Bacon.fromBinder (handler) =>
    @on(eventName, selector, handler)
    => @off(eventName, selector, handler)
  , eventTransformer

(jQuery ? (Zepto ? null))?.fn.asEventStream = Bacon.$.asEventStream

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
  sub = target.addEventListener ? (target.addListener ? target.bind)
  unsub = target.removeEventListener ? (target.removeListener ? target.unbind)
  Bacon.fromBinder (handler) ->
    sub.call(target, eventName, handler)
    -> unsub.call(target, eventName, handler)
  , eventTransformer

Bacon.fromPromise = (promise, abort) ->
  Bacon.fromBinder (handler) ->
    promise.then(handler, (e) -> handler(new Error(e)))
    -> promise.abort?() if abort
  , (value) -> [value, end()]


Bacon.noMore = ["<no-more>"]

Bacon.more = ["<more>"]

Bacon.later = (delay, value) ->
  Bacon.sequentially(delay, [value])

Bacon.sequentially = (delay, values) ->
  index = 0
  Bacon.fromPoll delay, ->
    value = values[index++]
    if index < values.length
      value
    else if index == values.length
      [value, end()]
    else
      end()

Bacon.repeatedly = (delay, values) ->
  index = 0
  Bacon.fromPoll(delay, -> values[index++ % values.length])

withMethodCallSupport = (wrapped) ->
  (f, args...) ->
    if typeof f == "object" and args.length
      context = f
      methodName = args[0]
      f = ->
        context[methodName](arguments...)
      args = args.slice(1)
    wrapped(f, args...)

liftCallback = (wrapped) ->
  withMethodCallSupport (f, args...) ->
    stream = partiallyApplied(wrapped, [(values, callback) ->
      f(values..., callback)])
    Bacon.combineAsArray(args).flatMap(stream)

Bacon.fromCallback = liftCallback (f, args...) ->
  Bacon.fromBinder (handler) ->
    makeFunction(f, args)(handler)
    nop
  , (value) -> [value, end()]

Bacon.fromNodeCallback = liftCallback (f, args...) ->
  Bacon.fromBinder (handler) ->
    makeFunction(f, args)(handler)
    nop
  , (error, value) ->
      return [new Error(error), end()] if error
      [value, end()]

Bacon.fromPoll = (delay, poll) ->
  Bacon.fromBinder (handler) ->
    id = Bacon.scheduler.setInterval(handler, delay)
    -> Bacon.scheduler.clearInterval(id)
  , poll

Bacon.interval = (delay, value) ->
  value = {} unless value?
  Bacon.fromPoll(delay, -> next(value))

Bacon.constant = (value) ->
  new Property (sink) ->
    sink (initial value)
    sink (end())
    nop

Bacon.never = -> Bacon.fromArray([])

Bacon.once = (value) -> Bacon.fromArray([value])

Bacon.fromArray = (values) ->
  assertArray values
  values = cloneArray(values)
  new EventStream (sink) ->
    unsubd = false
    send = ->
      if _.empty values
        sink(end())
      else
        value = values.splice(0,1)[0]
        reply = sink(toEvent(value))
        if (reply != Bacon.noMore) && !unsubd
          send()
    send()
    -> unsubd = true

Bacon.mergeAll = (streams...) ->
  if streams[0] instanceof Array
    streams = streams[0]
  _.fold(streams, Bacon.never(), ((a, b) -> a.merge(b)))

Bacon.zipAsArray = (streams...) ->
  if streams[0] instanceof Array
    streams = streams[0]
  Bacon.zipWith(streams, (xs...) -> xs)

Bacon.zipWith = (f, streams...) ->
  if !isFunction(f)
    [streams, f] = [f, streams[0]]
  Bacon.when _.map(((s) -> s.toEventStream()), streams), f

Bacon.combineAsArray = (streams...) ->
  if (streams.length == 1 and streams[0] instanceof Array)
    streams = streams[0]
  for stream, index in streams
    streams[index] = Bacon.constant(stream) if not (stream instanceof Observable)
  if streams.length
    sources = for s in streams
      new Source(s, true, false, s.subscribeInternal)
    Bacon.when(sources, ((xs...) -> xs)).toProperty()
  else
    Bacon.constant([])

Bacon.onValues = (streams..., f) -> Bacon.combineAsArray(streams).onValues(f)

Bacon.combineWith = (f, streams...) ->
  Bacon.combineAsArray(streams).map (values) -> f(values...)

Bacon.combineTemplate = (template) ->
  funcs = []
  streams = []
  current = (ctxStack) -> ctxStack[ctxStack.length - 1]
  setValue = (ctxStack, key, value) -> current(ctxStack)[key] = value
  applyStreamValue = (key, index) -> (ctxStack, values) -> setValue(ctxStack, key, values[index])
  constantValue = (key, value) -> (ctxStack) -> setValue(ctxStack, key, value)
  mkContext = (template) -> if template instanceof Array then [] else {}
  compile = (key, value) ->
    if (value instanceof Observable)
      streams.push(value)
      funcs.push(applyStreamValue(key, streams.length - 1))
    else if (value == Object(value) and typeof value != "function")
      pushContext = (key) -> (ctxStack) ->
        newContext = mkContext(value)
        setValue(ctxStack, key, newContext)
        ctxStack.push(newContext)
      popContext = (ctxStack) -> ctxStack.pop()
      funcs.push(pushContext(key))
      compileTemplate(value)
      funcs.push(popContext)
    else
      funcs.push(constantValue(key, value))
  compileTemplate = (template) -> _.each(template, compile)
  compileTemplate template
  combinator = (values) ->
    rootContext = mkContext(template)
    ctxStack = [rootContext]
    for f in funcs
       f(ctxStack, values)
    rootContext
  Bacon.combineAsArray(streams).map(combinator)

class Event
  isEvent: -> true
  isEnd: -> false
  isInitial: -> false
  isNext: -> false
  isError: -> false
  hasValue: -> false
  filter: -> true

class Next extends Event
  constructor: (valueF) ->
    if isFunction(valueF)
      @value = _.cached(valueF)
    else
      @value = _.always(valueF)
  isNext: -> true
  hasValue: -> true
  fmap: (f) -> @apply(=> f(@value()))
  apply: (value) -> new Next(value)
  filter: (f) -> f(@value())
  describe: -> @value()

class Initial extends Next
  isInitial: -> true
  isNext: -> false
  apply: (value) -> new Initial(value)
  toNext: -> new Next(@value)

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
  errors: -> @filter(-> false)
  filter: (f, args...) ->
    convertArgsToFunction this, f, args, (f) ->
      @withHandler (event) ->
        if event.filter(f)
          @push event
        else
          Bacon.more
  takeWhile: (f, args...) ->
    convertArgsToFunction this, f, args, (f) ->
      @withHandler (event) ->
        if event.filter(f)
          @push event
        else
          @push end()
          Bacon.noMore
  endOnError: (f, args...) ->
    f = true if !f?
    convertArgsToFunction this, f, args, (f) ->
      @withHandler (event) ->
        if event.isError() && f(event.error)
          @push event
          @push end()
        else
          @push event
  take: (count) ->
    return Bacon.never() if count <= 0
    @withHandler (event) ->
      if !event.hasValue()
        @push event
      else
        count--
        if count > 0
          @push event
        else
          @push event if count == 0
          @push end()
          Bacon.noMore

  map: (p, args...) ->
    if (p instanceof Property)
      p.sampledBy(this, former)
    else
      convertArgsToFunction this, p, args, (f) ->
        @withHandler (event) ->
          @push event.fmap(f)

  mapError : ->
    f = makeFunctionArgs(arguments)
    @withHandler (event) ->
      if event.isError()
        @push next (f event.error)
      else
        @push event
  mapEnd : ->
    f = makeFunctionArgs(arguments)
    @withHandler (event) ->
      if (event.isEnd())
        @push next(f(event))
        @push end()
        Bacon.noMore
      else
        @push event
  doAction: ->
    f = makeFunctionArgs(arguments)
    @withHandler (event) ->
      f(event.value()) if event.hasValue()
      @push event

  skip : (count) ->
    @withHandler (event) ->
      if !event.hasValue()
        @push event
      else if (count > 0)
        count--
        Bacon.more
      else
        @push event

  skipDuplicates: (isEqual = (a, b) -> a is b) ->
    @withStateMachine None, (prev, event) ->
      if !event.hasValue()
        [prev, [event]]
      else if event.isInitial() or prev == None or not isEqual(prev.get(), event.value())
        [new Some(event.value()), [event]]
      else
        [prev, []]
  skipErrors: ->
    @withHandler (event) ->
      if event.isError()
        Bacon.more
      else
        @push event

  withStateMachine: (initState, f) ->
    state = initState
    @withHandler (event) ->
      fromF = f(state, event)
      [newState, outputs] = fromF
      state = newState
      reply = Bacon.more
      for output in outputs
        reply = @push output
        if reply == Bacon.noMore
          return reply
      reply
  scan: (seed, f, lazyF) =>
    f_ = toCombinator(f)
    f = if lazyF then f_ else (x,y) -> f_(x(), y())
    acc = toOption(seed).map((x) -> _.always(x))
    subscribe = (sink) =>
      initSent = false
      unsub = nop
      reply = Bacon.more
      sendInit = ->
        if !initSent
          initSent = true
          acc.forEach (valueF) ->
            reply = sink(new Initial(valueF))
            if (reply == Bacon.noMore)
              unsub()
              unsub = nop
      unsub = @subscribe (event) =>
        if (event.hasValue())
          if (initSent && event.isInitial())
            Bacon.more # init already sent, skip this one
          else
            sendInit() unless event.isInitial()
            initSent = true
            prev = acc.getOrElse(-> undefined)
            next = _.cached(-> f(prev, event.value))
            acc = new Some(next)
            sink (event.apply(next))
        else
          if event.isEnd()
            reply = sendInit()
          sink event unless reply == Bacon.noMore
      sendInit()
      unsub
    new Property(subscribe)

  fold: (seed, f) =>
    @scan(seed, f).sampledBy(@filter(false).mapEnd().toProperty())

  zip: (other, f = Array) ->
    Bacon.zipWith([this,other], f)

  diff: (start, f) ->
    f = toCombinator(f)
    @scan([start], (prevTuple, next) ->
      [next, f(prevTuple[0], next)])
    .filter((tuple) -> tuple.length == 2)
    .map((tuple) -> tuple[1])

  flatMap: (f, firstOnly) ->
    f = makeSpawner(f)
    root = this
    new EventStream (sink) ->
      composite = new CompositeUnsubscribe()
      checkEnd = (unsub) ->
        unsub()
        sink end() if composite.empty()
      composite.add (__, unsubRoot) -> root.subscribe (event) ->
        if event.isEnd()
          checkEnd(unsubRoot)
        else if event.isError()
          sink event
        else if firstOnly and composite.count() > 1
          Bacon.more
        else
          return Bacon.noMore if composite.unsubscribed
          child = f event.value()
          child = Bacon.once(child) if not (child instanceof Observable)
          composite.add (unsubAll, unsubMe) -> child.subscribe (event) ->
            if event.isEnd()
              checkEnd(unsubMe)
              Bacon.noMore
            else
              if event instanceof Initial
                # To support Property as the spawned stream
                event = event.toNext()
              reply = sink event
              unsubAll() if reply == Bacon.noMore
              reply
      composite.unsubscribe

  flatMapFirst: (f) -> @flatMap(f, true)

  flatMapLatest: (f) =>
    f = makeSpawner(f)
    stream = @toEventStream()
    stream.flatMap (value) =>
      f(value).takeUntil(stream)
  not: -> @map((x) -> !x)
  log: (args...) ->
    @subscribe (event) -> console?.log?(args..., event.describe())
    this
  slidingWindow: (n, minValues = 0) ->
    this.scan([], ((window, value) -> window.concat([value]).slice(-n)))
        .filter(((values) -> values.length >= minValues))
  combine: (other, f) =>
    combinator = toCombinator(f)
    Bacon.combineAsArray(this, other)
      .map (values) ->
        combinator(values[0], values[1])
  decode: (cases) -> @combine(Bacon.combineTemplate(cases), (key, values) -> values[key])

  awaiting: (other) ->
    this.toEventStream().map(true).merge(other.toEventStream().map(false)).toProperty(false)


Observable :: reduce = Observable :: fold

class EventStream extends Observable
  constructor: (subscribe) ->
    super()
    assertFunction subscribe
    dispatcher = new Dispatcher(subscribe)
    @subscribe = dispatcher.subscribe
    @subscribeInternal = @subscribe
    @hasSubscribers = dispatcher.hasSubscribers
  delay: (delay) ->
    @flatMap (value) ->
      Bacon.later delay, value
  debounce: (delay) ->
    @flatMapLatest (value) ->
      Bacon.later delay, value

  debounceImmediate: (delay) ->
    @flatMapFirst (value) ->
      Bacon.once(value).concat(Bacon.later(delay).filter(false))

  throttle: (delay) ->
    @bufferWithTime(delay).map((values) -> values[values.length - 1])

  bufferWithTime: (delay) -> @bufferWithTimeOrCount(delay, Number.MAX_VALUE)
  bufferWithCount: (count) -> @bufferWithTimeOrCount(undefined, count)

  bufferWithTimeOrCount: (delay, count) ->
    flushOrSchedule = (buffer) ->
      if buffer.values.length == count
        buffer.flush()
      else if (delay != undefined)
        buffer.schedule()
    @buffer(delay, flushOrSchedule, flushOrSchedule)


  buffer: (delay, onInput = (->), onFlush = (->)) ->
    buffer = {
      scheduled: false
      end : null
      values : []
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
        if not @scheduled
          @scheduled = true
          delay(=> @flush())
    }
    reply = Bacon.more
    if not isFunction(delay)
      delayMs = delay
      delay = (f) -> Bacon.scheduler.setTimeout(f, delayMs)
    @withHandler (event) ->
      buffer.push = @push
      if event.isError()
        reply = @push event
      else if event.isEnd()
        buffer.end = event
        if not buffer.scheduled
          buffer.flush()
      else
        buffer.values.push(event.value())
        onInput(buffer)
      reply

  merge: (right) ->
    assertEventStream(right)
    left = this
    new EventStream (sink) ->
      ends = 0
      smartSink = (obs) -> (unsubBoth) -> obs.subscribe (event) ->
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
      compositeUnsubscribe (smartSink left), (smartSink right)

  toProperty: (initValue) ->
    initValue = None if arguments.length == 0
    @scan(initValue, latterF, true)

  toEventStream: -> this

  sampledBy: (sampler, combinator) =>
    @toProperty().sampledBy(sampler, combinator)

  concat: (right) ->
    left = this
    new EventStream (sink) ->
      unsubRight = nop
      unsubLeft = left.subscribe (e) ->
        if e.isEnd()
          unsubRight = right.subscribe sink
        else
          sink(e)
      -> unsubLeft() ; unsubRight()

  takeUntil: (stopper) =>
    self = this
    new EventStream (sink) ->
      stop = (unsubAll) ->
        stopper.onValue ->
          sink end()
          unsubAll()
          Bacon.noMore
      produce = (unsubAll) ->
        self.subscribe (x) ->
          reply = sink x
          unsubAll() if x.isEnd() or reply == Bacon.noMore
          reply
      compositeUnsubscribe stop, produce

  skipUntil: (starter) ->
    started = starter.take(1).map(true).toProperty(false)
    this.filter(started)

  skipWhile: (f, args...) ->
    ok = false
    convertArgsToFunction this, f, args, (f) ->
      @withHandler (event) ->
        if ok or !event.hasValue() or !f(event.value())
          ok = true if event.hasValue()
          @push event
        else
          Bacon.more

  startWith: (seed) ->
    Bacon.once(seed).concat(this)

  withHandler: (handler) ->
    dispatcher = new Dispatcher(@subscribe, handler)
    new EventStream(dispatcher.subscribe)
  withSubscribe: (subscribe) -> new EventStream(subscribe)

class Property extends Observable
  constructor: (subscribe, handler) ->
    super()
    if handler is true
      @subscribeInternal = subscribe
    else
      @subscribeInternal = new PropertyDispatcher(subscribe, handler).subscribe

    @sampledBy = (sampler, combinator) =>
      if combinator?
        combinator = toCombinator combinator
      else
        lazy = true
        combinator = (f) -> f()
      thisSource = new Source(this, false, false, this.subscribeInternal, lazy)
      samplerSource = new Source(sampler, true, false, sampler.subscribe, lazy)
      stream = Bacon.when([thisSource, samplerSource], combinator)
      if sampler instanceof Property then stream.toProperty() else stream

    @subscribe = (sink) =>
      # TODO: it's unoptimal to do this bookkeepping per subscriber
      reply = Bacon.more
      class LatestEvent
        set: (event) -> @event = event
        send: ->
          event = @event
          @event = null
          if event? and reply != Bacon.noMore
            reply = sink event
            unsub() if reply == Bacon.noMore
      value = new LatestEvent()
      end = new LatestEvent()
      unsub = nop
      unsub = @subscribeInternal (event) =>
        if event.isError()
          reply = sink event if reply != Bacon.noMore
        else
          if event.hasValue()
            value.set(event)
          else if event.isEnd()
            end.set(event)
          PropertyTransaction.onDone ->
            value.send()
            end.send()
        reply
      ->
        reply = Bacon.noMore
        unsub()

  sample: (interval) =>
    @sampledBy Bacon.interval(interval, {})

  changes: => new EventStream (sink) =>
    @subscribe (event) =>
      #console.log "CHANGES", event.describe()
      sink event unless event.isInitial()
  withHandler: (handler) ->
    new Property(@subscribeInternal, handler)
  withSubscribe: (subscribe) -> new Property(subscribe)
  toProperty: =>
    assertNoArguments(arguments)
    this
  toEventStream: =>
    new EventStream (sink) =>
      @subscribe (event) =>
        event = event.toNext() if event.isInitial()
        sink event
  and: (other) -> @combine(other, (x, y) -> x && y)
  or:  (other) -> @combine(other, (x, y) -> x || y)
  delay: (delay) -> @delayChanges((changes) -> changes.delay(delay))
  debounce: (delay) -> @delayChanges((changes) -> changes.debounce(delay))
  throttle: (delay) -> @delayChanges((changes) -> changes.throttle(delay))
  delayChanges: (f) -> addPropertyInitValueToStream(this, f(@changes()))
  takeUntil: (stopper) ->
    changes = this.changes().takeUntil(stopper)
    addPropertyInitValueToStream(this, changes)
  startWith: (value) ->
    @scan(value, (prev, next) -> next)

convertArgsToFunction = (obs, f, args, method) ->
  if f instanceof Property
    sampled = f.sampledBy(obs, (p,s) -> [p,s])
    method.apply(sampled, [([p, s]) -> p])
     .map(([p, s]) -> s)
  else
    f = makeFunction(f, args)
    method.apply(obs, [f])

addPropertyInitValueToStream = (property, stream) ->
  getInitValue = (property) ->
    value = None
    property.subscribe (event) ->
      if event.hasValue()
        value = new Some(event.value())
      Bacon.noMore
    value
  stream.toProperty(getInitValue(property))

class Dispatcher
  constructor: (subscribe, handleEvent) ->
    subscribe ?= -> nop
    subscriptions = []
    queue = null
    pushing = false
    ended = false
    @hasSubscribers = -> subscriptions.length > 0
    prevError = null
    unsubscribeFromSource = nop
    removeSub = (subscription) ->
      subscriptions = _.without(subscription, subscriptions)
    waiters = null
    done = ->
      if waiters?
        ws = waiters
        waiters = null
        w() for w in ws
    @push = (event) =>
      if not pushing
        return if event is prevError
        prevError = event if event.isError()
        success = false
        try
          pushing = true
          tmp = subscriptions
          for sub in tmp
            reply = sub.sink event
            removeSub sub if reply == Bacon.noMore or event.isEnd()
          success = true
        finally
          pushing = false
          queue = null if not success # ditch queue in case of exception to avoid unexpected behavior
        success = true
        while queue?.length
          event = _.head(queue)
          queue = _.tail(queue)
          @push event
        done(event)
        if @hasSubscribers()
          Bacon.more
        else
          Bacon.noMore
      else
        queue = (queue or []).concat([event])
        Bacon.more
    handleEvent ?= (event) -> @push event
    @handleEvent = (event) =>
      if event.isEnd()
        ended = true
      handleEvent.apply(this, [event])
    @subscribe = (sink) =>
      if ended
        sink end()
        nop
      else
        assertFunction sink
        subscription = { sink: sink }
        subscriptions = subscriptions.concat(subscription)
        if subscriptions.length == 1
          unsubscribeFromSource = subscribe @handleEvent
        assertFunction unsubscribeFromSource
        =>
          removeSub subscription
          unsubscribeFromSource() unless @hasSubscribers()

class PropertyDispatcher extends Dispatcher
  constructor: (subscribe, handleEvent) ->
    super(subscribe, handleEvent)
    current = None
    push = @push
    subscribe = @subscribe
    ended = false
    @push = (event) =>
      if event.isEnd()
        ended = true
      if event.hasValue()
        current = new Some(event.value)
        #console.log "push", event.value()
      PropertyTransaction.inTransaction =>
        push.apply(this, [event])
    @subscribe = (sink) =>
      initSent = false
      # init value is "bounced" here because the base Dispatcher class
      # won't add more than one subscription to the underlying observable.
      # without bouncing, the init value would be missing from all new subscribers
      # after the first one
      shouldBounceInitialValue = => @hasSubscribers() or ended
      reply = current.filter(shouldBounceInitialValue).map(
        (val) ->
          sink initial(val()))
      if reply.getOrElse(Bacon.more) == Bacon.noMore
        nop
      else if ended
        sink end()
        nop
      else
        subscribe.apply(this, [sink])

PropertyTransaction = (->
  txListeners = []
  tx = false
  onDone = (f) -> if tx then txListeners.push(f) else f()
  inTransaction = (f) ->
    if tx
      #console.log "in tx"
      f()
    else
      #console.log "start tx"
      tx = true
      try
        result = f()
      finally
        tx = false
      gs = txListeners
      #console.log "after tx", txListeners.length
      txListeners = []
      g() for g in gs
      result
  { onDone, inTransaction }
 )()

class Bus extends EventStream
  constructor: ->
    sink = undefined
    subscriptions = []
    ended = false
    guardedSink = (input) => (event) =>
      if (event.isEnd())
        unsubscribeInput(input)
        Bacon.noMore
      else
        sink event
    unsubAll = ->
      sub.unsub?() for sub in subscriptions
    subscribeInput = (subscription) ->
      subscription.unsub = (subscription.input.subscribe(guardedSink(subscription.input)))
    unsubscribeInput = (input) ->
      for sub, i in subscriptions
        if sub.input == input
          sub.unsub?()
          subscriptions.splice(i, 1)
          return
    subscribeAll = (newSink) =>
      sink = newSink
      for subscription in cloneArray(subscriptions)
        subscribeInput(subscription)
      unsubAll
    super(subscribeAll)
    @plug = (input) =>
      return if ended
      sub = { input: input }
      subscriptions.push(sub)
      subscribeInput(sub) if (sink?)
      -> unsubscribeInput(input)
    @push = (value) =>
      sink? next(value)
    @error = (error) =>
      sink? new Error(error)
    @end = =>
      ended = true
      unsubAll()
      sink? end()

class Source
  constructor: (s, @sync, consume, @subscribe, lazy = false) ->
    queue = []
    invoke = if lazy then _.id else (f) -> f()
    @subscribe = s.subscribe if not @subscribe?
    @markEnded = -> @ended = true
    if consume
      @consume = () -> invoke(queue.shift())
      @push  = (x) -> queue.push(x)
      @mayHave = (c) -> !@ended || queue.length >= c
      @hasAtLeast = (c) -> queue.length >= c
    else
      @consume = () -> invoke(queue[0])
      @push  = (x) -> queue = [x]
      @mayHave = -> true
      @hasAtLeast = -> queue.length

Source.fromObservable = (s) ->
  if s instanceof Source
    s
  else if s instanceof Property
    new Source(s, false, false)
  else
    new Source(s, true, true)

Bacon.when = (patterns...) ->
    return Bacon.never() if patterns.length == 0
    len = patterns.length
    usage = "when: expecting arguments in the form (Observable+,function)+"
    assert usage, len % 2 == 0
    sources = []
    pats = []
    i = 0
    while (i < len)
       patSources = _.toArray patterns[i]
       f = patterns[i+1]
       pat = {f: (if isFunction(f) then f else (-> f)), ixs: []}
       for s in patSources
         assert (s instanceof Observable), usage
         index = indexOf(sources, s)
         if index < 0
            sources.push(s)
            index = sources.length - 1
         (ix.count++ if ix.index == index) for ix in pat.ixs
         pat.ixs.push {index: index, count: 1}
       pats.push pat if patSources.length > 0
       i = i + 2

    if !sources.length
      return Bacon.never()

    sources = _.map Source.fromObservable, sources

    new EventStream (sink) ->
      match = (p) ->
        _.all(p.ixs, (i) -> sources[i.index].hasAtLeast(i.count))
      cannotSync = (source) ->
        !source.sync or source.ended
      cannotMatch = (p) ->
        _.any(p.ixs, (i) -> !sources[i.index].mayHave(i.count))
      part = (source) -> (unsubAll) ->
        source.subscribe (e) ->
          if e.isEnd()
            source.markEnded()
            if _.all(sources, cannotSync) or _.all(pats, cannotMatch)
              reply = Bacon.noMore
              sink end()
          else if e.isError()
            reply = sink e
          else
            source.push e.value
            if source.sync
              for p in pats
                 if match(p)
                   val = -> p.f(sources[i.index].consume() for i in p.ixs ...)
                   reply = sink e.apply(val)
                   break
          unsubAll() if reply == Bacon.noMore
          reply or Bacon.more

      compositeUnsubscribe (part s,i for s,i in sources)...

Bacon.update = (initial, patterns...) ->
  lateBindFirst = (f) -> (args...) -> (i) -> f([i].concat(args)...)
  i = patterns.length - 1
  while (i > 0)
    unless patterns[i] instanceof Function
      patterns[i] = do(x=patterns[i])->(->x)
    patterns[i] = lateBindFirst patterns[i]
    i = i - 2
  Bacon.when(patterns...).scan initial, ((x,f) -> f x)

compositeUnsubscribe = (ss...) ->
  new CompositeUnsubscribe(ss).unsubscribe

class CompositeUnsubscribe
  constructor: (ss = []) ->
    @unsubscribed = false
    @subscriptions = []
    @starting = []
    @add s for s in ss
  add: (subscription) =>
    return if @unsubscribed
    ended = false
    unsub = nop
    @starting.push subscription
    unsubMe = =>
      return if @unsubscribed
      ended = true
      @remove unsub
      _.remove subscription, @starting
    unsub = subscription @unsubscribe, unsubMe
    @subscriptions.push unsub unless (@unsubscribed or ended)
    _.remove subscription, @starting
    unsub
  remove: (unsub) ->
    return if @unsubscribed
    unsub() if (_.remove unsub, @subscriptions) != undefined
  unsubscribe: =>
    return if @unsubscribed
    @unsubscribed = true
    s() for s in @subscriptions
    @subscriptions = []
    @starting = []
  count: =>
    return 0 if @unsubscribed
    @subscriptions.length + @starting.length
  empty: =>
    @count() == 0

Bacon.CompositeUnsubscribe = CompositeUnsubscribe

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

None =
  getOrElse: (value) -> value
  filter: -> None
  map: -> None
  forEach: ->
  isDefined: false
  toArray: -> []

Bacon.EventStream = EventStream
Bacon.Property = Property
Bacon.Observable = Observable
Bacon.Bus = Bus
Bacon.Initial = Initial
Bacon.Next = Next
Bacon.End = End
Bacon.Error = Error

nop = ->
latterF = (_, x) -> x()
former = (x, _) -> x
initial = (value) -> new Initial(_.always(value))
next = (value) -> new Next(_.always(value))
end = -> new End()
# instanceof more performant than x.?isEvent?()
toEvent = (x) -> if x instanceof Event then x else next x
cloneArray = (xs) -> xs.slice(0)
indexOf = if Array::indexOf
  (xs, x) -> xs.indexOf(x)
else
  (xs, x) ->
    for y, i in xs
      return i if x == y
    -1
assert = (message, condition) -> throw message unless condition
assertEvent = (event) -> assert "not an event : " + event, event instanceof Event and event.isEvent()
assertEventStream = (event) -> assert "not an EventStream : " + event, event instanceof EventStream
assertFunction = (f) -> assert "not a function : " + f, isFunction(f)
isFunction = (f) -> typeof f == "function"
assertArray = (xs) -> assert "not an array : " + xs, xs instanceof Array
assertNoArguments = (args) -> assert "no arguments supported", args.length == 0
assertString = (x) -> assert "not a string : " + x, typeof x == "string"
partiallyApplied = (f, applied) ->
  (args...) -> f((applied.concat(args))...)
makeSpawner = (f) ->
    f = _.always(f) if f instanceof Observable
    assertFunction(f)
    f
makeFunctionArgs = (args) ->
  args = Array.prototype.slice.call(args)
  makeFunction_ args...
makeFunction_ = withMethodCallSupport (f, args...) ->
  if isFunction f
    if args.length then partiallyApplied(f, args) else f
  else if isFieldKey(f)
    toFieldExtractor(f, args)
  else
    _.always f

makeFunction = (f, args) ->
  makeFunction_(f, args...)

isFieldKey = (f) ->
  (typeof f == "string") and f.length > 1 and f.charAt(0) == "."
Bacon.isFieldKey = isFieldKey
toFieldExtractor = (f, args) ->
  parts = f.slice(1).split(".")
  partFuncs = _.map(toSimpleExtractor(args), parts)
  (value) ->
    for f in partFuncs
      value = f(value)
    value
toSimpleExtractor = (args) -> (key) -> (value) ->
  if not value?
    undefined
  else
    fieldValue = value[key]
    if isFunction(fieldValue)
      fieldValue.apply(value, args)
    else
      fieldValue

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

_ = {
  head: (xs) -> xs[0]
  always: (x) -> (-> x)
  negate: (f) -> (x) -> not f(x)
  empty: (xs) -> xs.length == 0
  tail: (xs) -> xs[1...xs.length]
  filter: (f, xs) ->
    filtered = []
    for x in xs
      filtered.push(x) if f(x)
    filtered
  map: (f, xs) ->
    f(x) for x in xs
  each: (xs, f) ->
    for key, value of xs
      f(key, value)
  toArray: (xs) -> if (xs instanceof Array) then xs else [xs]
  contains: (xs, x) -> indexOf(xs, x) != -1
  id: (x) -> x
  last: (xs) -> xs[xs.length-1]
  all: (xs, f = _.id) ->
    for x in xs
      return false if not f(x)
    return true
  any: (xs, f = _.id) ->
    for x in xs
      return true if f(x)
    return false
  without: (x, xs) ->
    _.filter(((y) -> y != x), xs)
  remove: (x, xs) ->
    i = indexOf(xs, x)
    if i >= 0
      xs.splice(i, 1)
  fold: (xs, seed, f) ->
    for x in xs
      seed = f(seed, x)
    seed
  cached: (f) ->
    value = None
    ->
      if value == None
        value = f()
        f = null
      value
}

Bacon._ = _

Bacon.scheduler =
  setTimeout: (f,d) -> setTimeout(f,d)
  setInterval: (f, i) -> setInterval(f, i)
  clearInterval: (id) -> clearInterval(id)
  now: -> new Date().getTime()

if module?
  module.exports = Bacon # for Bacon = require 'baconjs'
  Bacon.Bacon = Bacon # for {Bacon} = require 'baconjs'
else
  if define? and define.amd?
    define [], -> Bacon
  @Bacon = Bacon # otherwise for execution context
