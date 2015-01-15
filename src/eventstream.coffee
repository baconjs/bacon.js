# build-dependencies: observable
# build-dependencies: describe
# build-dependencies: functionconstruction
# build-dependencies: dispatcher
# build-dependencies: optional

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

Bacon.EventStream = EventStream

