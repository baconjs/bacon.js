# build-dependencies: observable
# build-dependencies: describe
# build-dependencies: functionconstruction
# build-dependencies: dispatcher
# build-dependencies: optional
# build-dependencies: helpers

class EventStream extends Observable
  constructor: (desc, subscribe, handler) ->
    if this not instanceof EventStream
      return new EventStream(desc, subscribe, handler)
    if _.isFunction desc
      handler = subscribe
      subscribe = desc
      desc = Desc.empty
    super(desc)
    assertFunction subscribe
    @dispatcher = new Dispatcher(subscribe, handler)
    registerObs(this)

  toProperty: (initValue_) ->
    initValue = if arguments.length == 0 then None else toOption(-> initValue_)
    disp = @dispatcher
    new Property((new Bacon.Desc(this, "toProperty", [initValue_])),
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

  withHandler: (handler) ->
    new EventStream (new Bacon.Desc(this, "withHandler", [handler])), @dispatcher.subscribe, handler

Bacon.EventStream = EventStream

Bacon.never = ->
  new EventStream describe(Bacon, "never"), (sink) ->
    sink (endEvent())
    nop


