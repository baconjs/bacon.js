describe "EventStream.take", ->
  describe "takes N first elements", ->
    expectStreamEvents(
      -> series(1, [1,2,3,4]).take(2)
      [1,2])
  describe "works with N=0", ->
    expectStreamEvents(
      -> series(1, [1,2,3,4]).take(0)
      [])
  describe "will stop properly even when exception thrown by subscriber", ->
    expectStreamEvents(
      ->
        s = repeatedly(t(1), ["lol", "wut"]).take(2)
        s.onValue (value) ->
          throw "testing" if value == "lol" # special string that will be catched by TickScheduler
        s
      ["lol", "wut"], unstable)
  describe "works with synchronous source", ->
    expectStreamEvents(
      -> fromArray([1,2,3,4]).take(2)
      [1,2])
  it "toString", ->
    expect(Bacon.never().take(1).toString()).to.equal("Bacon.never().take(1)")

describe "Property.take(1)", ->
  describe "takes the Initial event", ->
    expectPropertyEvents(
      -> series(1, [1,2,3]).toProperty(0).take(1)
      [0])
  describe "takes the first Next event, if no Initial value", ->
    expectPropertyEvents(
      -> series(1, [1,2,3]).toProperty().take(1)
      [1])
  describe "works for constants", ->
    expectPropertyEvents(
      -> Bacon.constant(1)
      [1])
  describe "works for never-ending Property", ->
    expectPropertyEvents(
      -> repeat(1, [1,2,3]).toProperty(0).take(1)
      [0])
    expectPropertyEvents(
      -> repeat(1, [1,2,3]).toProperty().take(1)
      [1])

describe "Bacon.once().take(1)", ->
  describe "works", ->
    expectStreamEvents(
      -> once(1).take(1)
      [1])
