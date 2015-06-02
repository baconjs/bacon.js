# build-dependencies: fromarray
# build-dependencies: when
# build-dependencies: once

Bacon.EventStream :: holdWhen = (valve) ->
  composite = new CompositeUnsubscribe()
  onHold = false
  bufferedValues = []
  subscribed = false
  src = this
  new EventStream (new Bacon.Desc(this, "holdWhen", [valve])), (sink) ->
    endIfBothEnded = (unsub) ->
      unsub?()
      if composite.empty() && subscribed
        sink endEvent()
    composite.add (unsubAll, unsubMe) -> valve.subscribe (event) ->
      if event.hasValue()
        onHold = event.value()
        if !onHold
          toSend = bufferedValues
          bufferedValues = []
          _.each toSend, (index, value) ->
            sink nextEvent(value)
      else if event.isEnd()
        endIfBothEnded(unsubMe)
      else
        sink(event)
    composite.add (unsubAll, unsubMe) -> src.subscribe (event) ->
      if onHold and event.hasValue()
        bufferedValues.push(event.value())
      else if event.isEnd() && bufferedValues.length
        endIfBothEnded(unsubMe)
      else
        sink(event)
    subscribed = true
    endIfBothEnded()
    composite.unsubscribe
