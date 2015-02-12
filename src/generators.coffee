# build-dependencies: factories, _, event

Bacon.fromStreamGenerator = (generator) ->
  Bacon.fromBinder (sink) ->
    unsub = ->
    empty = true
    handleEvent = (event) ->
      if event.isEnd()
        if empty
          sink endEvent()
        else
          empty = true
          subscribeNext()
      else
        empty = false
        sink event
    subscribeNext = ->
      next = generator()
      unsub = next.subscribeInternal(handleEvent)
    subscribeNext()
    -> unsub()

Bacon.fromGenerator = (generator) ->
  Bacon.fromBinder (sink) ->
    unsubd = false
    push = (events) ->
      events = Bacon._.toArray(events)
      for event in events
        return if unsubd
        reply = sink event
        return if event.isEnd() or reply == Bacon.noMore
      generator(push)
    push []
    -> unsubd = true

Bacon.fromSynchronousGenerator = (generator) ->
  Bacon.fromGenerator (push) ->
    push generator()
