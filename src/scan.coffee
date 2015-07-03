# build-dependencies: optional
# build-dependencies: core
# build-dependencies: functionconstruction
# build-dependencies: when
# build-dependencies: updatebarrier

Bacon.Observable :: scan = (seed, f) ->
  f = toCombinator(f)
  acc = toOption(seed)
  initHandled = false
  subscribe = (sink) =>
    initSent = false
    unsub = nop
    reply = Bacon.more
    sendInit = ->
      unless initSent
        acc.forEach (value) ->
          initSent = initHandled = true
          reply = sink(new Initial(-> value))
          if (reply == Bacon.noMore)
            unsub()
            unsub = nop
    unsub = @dispatcher.subscribe (event) ->
      if (event.hasValue())
        if (initHandled and event.isInitial())
          #console.log "skip INITIAL"
          Bacon.more # init already sent, skip this one
        else
          sendInit() unless event.isInitial()
          initSent = initHandled = true
          prev = acc.getOrElse(undefined)
          next = f(prev, event.value())
          #console.log prev , ",", event.value(), "->", next
          acc = new Some(next)
          sink (event.apply(-> next))
      else
        if event.isEnd()
          reply = sendInit()
        sink event unless reply == Bacon.noMore
    UpdateBarrier.whenDoneWith resultProperty, sendInit
    unsub
  resultProperty = new Property (new Bacon.Desc(this, "scan", [seed, f])), subscribe
