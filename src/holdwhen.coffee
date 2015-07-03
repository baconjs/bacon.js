# build-dependencies: fromarray
# build-dependencies: when
# build-dependencies: once

Bacon.EventStream :: holdWhen = (valve) ->
  onHold = false
  bufferedValues = []
  src = this
  new EventStream (new Bacon.Desc(this, "holdWhen", [valve])), (sink) ->
    composite = new CompositeUnsubscribe()
    subscribed = false
    endIfBothEnded = (unsub) ->
      unsub?()
      if composite.empty() && subscribed
        sink endEvent()
    composite.add (unsubAll, unsubMe) -> valve.subscribeInternal (event) ->
      if event.hasValue()
        onHold = event.value()
        if !onHold
          toSend = bufferedValues
          bufferedValues = []
          for value in toSend
            sink nextEvent(value)
      else if event.isEnd()
        endIfBothEnded(unsubMe)
      else
        sink(event)
    composite.add (unsubAll, unsubMe) -> src.subscribeInternal (event) ->
      if onHold and event.hasValue()
        bufferedValues.push(event.value())
      else if event.isEnd() && bufferedValues.length
        endIfBothEnded(unsubMe)
      else
        sink(event)
    subscribed = true
    endIfBothEnded()
    composite.unsubscribe
