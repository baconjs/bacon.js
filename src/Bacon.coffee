if module?
  module.exports = Bacon = {} # for Bacon = require 'baconjs'
  Bacon.Bacon = Bacon # for {Bacon} = require 'baconjs'
else
  if typeof require is 'function' and require.amd?
      define 'bacon', [], -> Bacon
  @Bacon = Bacon = {} # otherwise for execution context

# eventTransformer - should return one value or one or many events
Bacon.fromBinder = (binder, eventTransformer = _.id) ->
  new EventStream (sink) ->
    unbinder = binder (args...) ->
      value = eventTransformer(args...)
      unless value instanceof Array and _.last(value) instanceof Event
        value = [value]

      for event in value
        reply = sink(event = toEvent(event))
        if reply == Bacon.noMore or event.isEnd()
          # defer if binder calls handler in sync before returning unbinder
          if unbinder? then unbinder() else Bacon.scheduler.setTimeout (-> unbinder()), 0

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

liftCallback = (wrapped) ->
  return (f, args...) ->
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
  new Property(sendWrapped([value], initial), true)

Bacon.never = -> Bacon.fromArray([])

Bacon.once = (value) -> Bacon.fromArray([value])

Bacon.fromArray = (values) ->
  new EventStream(sendWrapped(values, toEvent))

sendWrapped = (values, wrapper) ->
  (sink) ->
    for value in values
      sink (wrapper value)
    sink (end())
    nop

Bacon.mergeAll = (streams, more...) ->
  if not (streams instanceof Array)
    streams = [streams].concat(more)
  _.fold(streams, Bacon.never(), ((a, b) -> a.merge(b)))

Bacon.zipAsArray = (streams, more...) ->
  if not (streams instanceof Array)
    streams = [streams].concat(more)
  Bacon.zipWith(streams, Array)

Bacon.zipWith = (streams, f, more...) ->
    if isFunction(streams)
      g = streams
      streams = [f].concat(more)
      f = g
    new EventStream (sink) ->
      bufs = ([] for s in streams)
      unsubscribed = false
      unsubs = (nop for s in streams)
      unsubAll = (-> f() for f in unsubs ; unsubscribed = true)
      zipSink = (e) ->
        reply = sink e
        if reply == Bacon.noMore or e.isEnd()
          unsubAll()
        reply
      handle = (i) -> (e) ->
       if e.isError()
         zipSink e
       else if e.isInitial()
         Bacon.more
       else
         bufs[i].push(e)
         if not e.isEnd() and _.all(b.length for b in bufs)
           vs = (b.shift().value() for b in bufs)
           reply = zipSink e.apply _.always f(vs ...)
         if _.any(b.length and b[0].isEnd() for b in bufs)
           reply = zipSink end()
         reply or Bacon.more
      for s,j in streams
        unsubs[j] = do (i=j) ->
          s.subscribe (handle i) unless unsubscribed
      unsubAll

Bacon.combineAsArray = (streams, more...) ->
  if not (streams instanceof Array)
    streams = [streams].concat(more)
  if streams.length
    values = (None for s in streams)
    new Property (sink) =>
      unsubscribed = false
      unsubs = (nop for s in streams)
      unsubAll = (-> f() for f in unsubs ; unsubscribed = true)
      ends = (false for s in streams)
      checkEnd = ->
        if _.all(ends)
          reply = sink end()
          unsubAll() if reply == Bacon.noMore
          reply
      initialSent = false
      combiningSink = (markEnd, setValue) =>
        (event) =>
          if (event.isEnd())
            markEnd()
            checkEnd()
            Bacon.noMore
          else if event.isError()
            reply = sink event
            unsubAll() if reply == Bacon.noMore
            reply
          else
            setValue(event.value)
            if _.all(_.map(((x) -> x.isDefined), values))
              if initialSent and event.isInitial()
                # don't send duplicate Initial
                Bacon.more
              else
                initialSent = true
                valueArrayF = -> (x.get()() for x in values)
                reply = sink(event.apply(valueArrayF))
                unsubAll() if reply == Bacon.noMore
                reply
            else
              Bacon.more
      sinkFor = (index) ->
        combiningSink(
          (-> ends[index] = true)
          ((x) -> values[index] = new Some(x)))
      for stream, index in streams
        stream = Bacon.constant(stream) if not (stream instanceof Observable)
        unsubs[index] = stream.subscribeInternal (sinkFor index) unless unsubscribed
      unsubAll
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
  constantValue = (key, value) -> (ctxStack, values) -> setValue(ctxStack, key, value)
  mkContext = (template) -> if template instanceof Array then [] else {}
  compile = (key, value) ->
    if (value instanceof Observable)
      streams.push(value)
      funcs.push(applyStreamValue(key, streams.length - 1))
    else if (value == Object(value) and typeof value != "function")
      pushContext = (key) -> (ctxStack, values) ->
        newContext = mkContext(value)
        setValue(ctxStack, key, newContext)
        ctxStack.push(newContext)
      popContext = (ctxStack, values) -> ctxStack.pop()
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
  filter: (f) -> true
  onDone : (listener) -> listener()

class Next extends Event
  constructor: (valueF, sourceEvent) ->
    if isFunction(valueF)
      @value = =>
        v = valueF()
        @value = _.always(v)
        v
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
  onValue: (f, args...) ->
    f = makeFunction(f, args)
    @subscribe (event) ->
      f event.value() if event.hasValue()
  onValues: (f) ->
    @onValue (args) -> f(args...)
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
    if (f instanceof Property)
      f.sampledBy(this, (p,s) -> [p,s])
       .filter(([p, s]) -> p)
       .map(([p, s]) -> s)
    else
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
  mapEnd : (f, args...) ->
    f = makeFunction(f, args)
    @withHandler (event) ->
      if (event.isEnd())
        @push next(f(event))
        @push end()
        Bacon.noMore
      else
        @push event
  doAction: (f, args...) ->
    f = makeFunction(f, args)
    @withHandler (event) ->
      f(event.value()) if event.hasValue()
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
          event.onDone ->
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
      else if prev == None or not isEqual(prev.get(), event.value())
        [new Some(event.value()), [event]]
      else
        [prev, []]
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
  scan: (seed, f) =>
    f = toCombinator(f)
    acc = toOption(seed)
    subscribe = (sink) =>
      initSent = false
      unsub = nop
      reply = Bacon.more
      sendInit = ->
        if !initSent
          initSent = true
          acc.forEach (value) ->
            reply = sink initial(value)
            if (reply == Bacon.noMore)
              unsub()
              unsub = nop
      unsub = @subscribe (event) =>
        if (event.hasValue())
          if (initSent && event.isInitial())
            Bacon.more # init already sent, skip this one
          else
            initSent = true
            acc = new Some(f(acc.getOrElse(undefined), event.value()))
            sink (event.apply(_.always(acc.get())))
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
        else if firstOnly and children.length
          Bacon.more
        else
          child = f event.value()
          child = Bacon.once(child) if not (child instanceof Observable)
          unsubChild = undefined
          childEnded = false
          removeChild = ->
            _.remove(unsubChild, children) if unsubChild?
            checkEnd()
          handler = (event) ->
            if event.isEnd()
              removeChild()
              childEnded = true
              Bacon.noMore
            else
              if event instanceof Initial
                # To support Property as the spawned stream
                event = event.toNext()
              reply = sink event
              if reply == Bacon.noMore
                unbind()
              reply
          unsubChild = child.subscribe handler
          children.push unsubChild if not childEnded
      unsubRoot = root.subscribe(spawner)
      unbind

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

Observable :: reduce = Observable :: fold

class EventStream extends Observable
  constructor: (subscribe) ->
    super()
    assertFunction subscribe
    dispatcher = new Dispatcher(subscribe)
    @subscribe = dispatcher.subscribe
    @subscribeInternal = @subscribe
    @hasSubscribers = dispatcher.hasSubscribers
  map: (p, args...) ->
    if (p instanceof Property)
      p.sampledBy(this, former)
    else
      super(p, args...)
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
    initValue = None if arguments.length == 0
    @scan(initValue, latter)

  toEventStream: -> this

  concat: (right) ->
    left = this
    new EventStream (sink) ->
      unsub = left.subscribe (e) ->
        if e.isEnd()
          unsub = right.subscribe sink
        else
          sink(e)
      -> unsub()

  skipUntil: (starter) ->
    starter.take(1).flatMap(this)

  awaiting: (other) ->
    this.map(true).merge(other.map(false)).toProperty(false)

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
      lazyCombinator = 
        if (combinator?)
          combinator = toCombinator(combinator)
          (myVal, otherVal) ->
            combinator(myVal.value(), otherVal.value())
        else
          (myVal, otherVal) -> myVal.value()
      myVal = None
      subscribe = (sink) => 
        unsubscribed = false
        unsubMe = nop
        unsubOther = nop
        unsubBoth = -> unsubMe() ; unsubOther() ; unsubscribed = true
        unsubMe = this.subscribeInternal (event) =>
          if event.hasValue()
            myVal = new Some(event)
          else if event.isError()
            sink event
        unsubOther = sampler.subscribe (event) =>
          if event.hasValue()
            myVal.forEach (myVal) =>
              sink(event.apply(lazyCombinator(myVal, event)))
          else
            if event.isEnd()
              unsubMe()
            sink event
        unsubBoth
      if sampler instanceof Property then new Property(subscribe) else new EventStream(subscribe)

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
    done = (event) ->
      if waiters?
        ws = waiters
        waiters = null
        w() for w in ws
      event.onDone = Event.prototype.onDone
    addWaiter = (listener) -> waiters = (waiters or []).concat([listener])
    @push = (event) =>
      if not pushing
        return if event is prevError
        prevError = event if event.isError()
        success = false
        try
          pushing = true
          event.onDone = addWaiter
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
        current = new Some(event.value())
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
        (val) -> sink initial(val))
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
        f()
      finally
        tx = false
      gs = txListeners
      #console.log "after tx", txListeners.length
      txListeners = []
      g() for g in gs
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
      unsubFuncs = []
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
latter = (_, x) -> x
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
methodCall = (obj, method, args) ->
  assertString(method)
  if args == undefined then args = []
  (value) -> obj[method]((args.concat([value]))...)
partiallyApplied = (f, applied) ->
  (args...) -> f((applied.concat(args))...)
makeSpawner = (f) ->
    f = _.always(f) if f instanceof Observable
    assertFunction(f)
    f
makeFunction = (f, args) ->
  if isFunction f
    if args.length then partiallyApplied(f, args) else f
  else if isFieldKey(f)
    toFieldExtractor(f, args)
  else if typeof f == "object" and args.length
    methodCall(f, _.head(args), _.tail(args))
  else
    _.always f
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

if define? and define.amd? then define? -> Bacon

_ = {
  head: (xs) -> xs[0],
  always: (x) -> (-> x),
  empty: (xs) -> xs.length == 0,
  tail: (xs) -> xs[1...xs.length],
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
  all: (xs) ->
    for x in xs
      return false if not x
    return true
  any: (xs) ->
    for x in xs
      return true if x
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
}

Bacon._ = _

Bacon.scheduler =
  setTimeout: (f,d) -> setTimeout(f,d)
  setInterval: (f, i) -> setInterval(f, i),
  clearInterval: (id) -> clearInterval(id),
  now: -> new Date().getTime()
