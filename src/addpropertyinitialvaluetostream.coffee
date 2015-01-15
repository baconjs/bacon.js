# build-dependencies: eventstream
# build-dependencies: updatebarrier
# build-dependencies: concat

addPropertyInitValueToStream = (property, stream) ->
  justInitValue = new EventStream describe(property, "justInitValue"), (sink) ->
    value = undefined
    unsub = property.dispatcher.subscribe (event) ->
      if !event.isEnd()
        value = event
      Bacon.noMore
    UpdateBarrier.whenDoneWith justInitValue, ->
      if value?
        sink value
      sink endEvent()
    unsub
  justInitValue.concat(stream).toProperty()
