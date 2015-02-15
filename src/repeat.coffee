# build-dependencies: factories, _, event

Bacon.repeat = (generator) ->
  Bacon.fromBinder (sink) ->
    flag = false # signal flag used to eliminate recursion on synchronous responses
    reply = Bacon.more
    unsub = ->
    handleEvent = (event) ->
      if event.isEnd()
        if !flag
          flag = true
        else
          subscribeNext()
      else
        reply = sink event
    subscribeNext = ->
      flag = true
      while flag and reply != Bacon.noMore
        next = generator()
        flag = false
        if next
          unsub = next.subscribeInternal(handleEvent)
        else
          sink endEvent()
      flag = true
    subscribeNext()
    -> unsub()
