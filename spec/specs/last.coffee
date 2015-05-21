describe "EventStream.last", ->
  describe "takes the last element", ->
    expectStreamEvents(
      -> series(1, [1,2,3,4]).last()
      [4])
  describe "works with empty stream", ->
    expectStreamEvents(
      -> series(1, []).last()
      [])
  describe.skip "will stop properly even when exception thrown by subscriber", ->
    expectStreamEvents(
      ->
        # skipped because hangs
        s = repeatedly(t(1), ["lol", "wut"]).last()
        s.onValue (value) ->
          throw "testing" if value == "lol" # special string that will be catched by TickScheduler
        s
      ["wut"], semiunstable)
  describe "works with synchronous source", ->
    expectStreamEvents(
      -> fromArray([1,2,3,4]).last()
      [4])
  it "toString", ->
    expect(Bacon.never().last().toString()).to.equal("Bacon.never().last()")

describe "Property.last()", ->
  describe "takes the Initial event", ->
    expectPropertyEvents(
      -> series(1, [1,2,3]).toProperty(0).last()
      [3])
  describe "takes the last Next event, if no Initial value", ->
    expectPropertyEvents(
      -> series(1, [1,2,3]).toProperty().last()
      [3])
  describe "works for constants", ->
    expectPropertyEvents(
      -> Bacon.constant(1)
      [1])

describe "Bacon.once().last()", ->
  describe "works", ->
    expectStreamEvents(
      -> once(1).last()
      [1])
