describe "EventStream.withStateMachine", ->
  f = (sum, event) ->
    if event.hasValue()
      [sum + event.value(), []]
    else if event.isEnd()
      [sum, [new Bacon.Next(-> sum), event]]
    else
      [sum, [event]]
  describe "runs state machine on the stream", ->
    expectStreamEvents(
      -> fromArray([1,2,3]).withStateMachine(0, f)
      [6])

describe "Property.withStateMachine", ->
  describe "runs state machine on the stream", ->
    expectPropertyEvents(
      -> series(1, [1,2,3]).toProperty().withStateMachine(0, (sum, event) ->
        if event.hasValue()
          [sum + event.value(), []]
        else if event.isEnd()
          [sum, [new Bacon.Next(-> sum), event]]
        else
          [sum, [event]])
      [6])
