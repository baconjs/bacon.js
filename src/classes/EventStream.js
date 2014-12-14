import Observable from "./Observable";

var idCounter = 0;

export class EventStream extends Observable {
  constructor() {
  	this.id = ++idCounter;
/*    withDescription(desc, this)
    @initialDesc = @desc*/
  }
}

/*
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
    if (p instanceof Property)
      p.sampledBy(this, former)
    else
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

  fold: (seed, f) ->
    withDescription(this, "fold", seed, f, @scan(seed, f).sampledBy(@filter(false).mapEnd().toProperty()))

  zip: (other, f = Array) ->
    withDescription(this, "zip", other,
      Bacon.zipWith([this,other], f))

  diff: (start, f) ->
    f = toCombinator(f)
    withDescription(this, "diff", start, f,
      @scan([start], (prevTuple, next) ->
        [next, f(prevTuple[0], next)])
      .filter((tuple) -> tuple.length == 2)
      .map((tuple) -> tuple[1]))

  flatMap: ->
    flatMap_ this, makeSpawner(arguments)

  flatMapFirst: ->
    flatMap_ this, makeSpawner(arguments), true

  flatMapWithConcurrencyLimit: (limit, args...) ->
    withDescription(this, "flatMapWithConcurrencyLimit", limit, args...,
      flatMap_ this, makeSpawner(args), false, limit)

  flatMapLatest: ->
    f = makeSpawner(arguments)
    stream = @toEventStream()
    withDescription(this, "flatMapLatest", f, stream.flatMap (value) ->
      makeObservable(f(value)).takeUntil(stream))

  flatMapError: (fn) ->
    withDescription(this, "flatMapError", fn, @mapError((err) -> new Error(err)).flatMap (x) ->
      if x instanceof Error
        fn(x.error)
      else
        Bacon.once(x))

  flatMapConcat: ->
    withDescription(this, "flatMapConcat", arguments...,
      @flatMapWithConcurrencyLimit 1, arguments...)

  bufferingThrottle: (minimumInterval) ->
    withDescription(this, "bufferingThrottle", minimumInterval,
      @flatMapConcat (x) ->
        Bacon.once(x).concat(Bacon.later(minimumInterval).filter(false)))

  not: -> withDescription(this, "not", @map((x) -> !x))

  log: (args...) ->
    @subscribe (event) -> console?.log?(args..., event.log())
    this

  slidingWindow: (n, minValues = 0) ->
    withDescription(this, "slidingWindow", n, minValues, @scan([], ((window, value) -> window.concat([value]).slice(-n)))
          .filter(((values) -> values.length >= minValues)))

  combine: (other, f) ->
    combinator = toCombinator(f)
    withDescription(this, "combine", other, f,
      Bacon.combineAsArray(this, other)
        .map (values) ->
          combinator(values[0], values[1]))

  decode: (cases) -> withDescription(this, "decode", cases, @combine(Bacon.combineTemplate(cases), (key, values) -> values[key]))

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
 */