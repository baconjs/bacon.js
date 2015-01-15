# build-dependencies: optional
# build-dependencies: core
# build-dependencies: functionconstruction
# build-dependencies: when

Bacon.Observable :: scan = (seed, f) ->
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
