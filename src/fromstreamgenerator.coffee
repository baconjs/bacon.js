# build-dependencies: factories, _, event

Bacon.fromStreamGenerator = (generator) ->
  Bacon.fromBinder (sink) ->
    unsub = ->
    handleEvent = (event) ->
      if event.isEnd()
        subscribeNext()
      else
        sink event
    subscribeNext = ->
      next = generator()
      if next
        unsub = next.subscribeInternal(handleEvent)
      else
        sink endEvent()
    subscribeNext()
    -> unsub()
