describe "Bacon.later", ->
  describe "should send single event and end", ->
    expectStreamEvents(
      -> Bacon.later(t(1), "lol")
      ["lol"])
  describe "supports sending an Error event as well", ->
    expectStreamEvents(
      -> Bacon.later(t(1), new Bacon.Error("oops"))
      [error()])
  it "toString", ->
    expect(Bacon.later(1, "wat").toString()).to.equal("Bacon.later(1,wat)")
  it "inspect", ->
    expect(Bacon.later(1, "wat").inspect()).to.equal("Bacon.later(1,wat)")

describe "Bacon.sequentially", ->
  describe "should send given events and end", ->
    expectStreamEvents(
      -> Bacon.sequentially(t(1), ["lol", "wut"])
      ["lol", "wut"])
  describe "include error events", ->
    expectStreamEvents(
      -> Bacon.sequentially(t(1), [error(), "lol"])
      [error(), "lol"])
  describe "will stop properly even when exception thrown by subscriber", ->
    expectStreamEvents(
      ->
        s = Bacon.sequentially(t(1), ["lol", "wut"])
        s.onValue (value) ->
          throw "testing"
        s
      ["lol", "wut"], unstable)
  it "toString", ->
    expect(Bacon.sequentially(1, [2]).toString()).to.equal("Bacon.sequentially(1,[2])")

describe "Bacon.repeatedly", ->
  describe "repeats given sequence forever", ->
    expectStreamEvents(
      -> take 5, Bacon.repeatedly(1, [1,2])
      [1,2,1,2,1])
  it "toString", ->
    expect(Bacon.repeatedly(1, [1]).toString()).to.equal("Bacon.repeatedly(1,[1])")

describe "Bacon.interval", ->
  describe "repeats single element indefinitely", ->
    expectStreamEvents(
      -> take 3, Bacon.interval(t(1), "x")
      ["x", "x", "x"])
  it "toString", ->
    expect(Bacon.interval(1, 2).toString()).to.equal("Bacon.interval(1,2)")

describe "Bacon.fromPoll", ->
  describe "repeatedly polls given function for values", ->
    expectStreamEvents(
      -> take 2, Bacon.fromPoll(1, (-> "lol"))
      ["lol", "lol"])
  it "toString", ->
    expect(Bacon.fromPoll(1, (->)).toString()).to.equal("Bacon.fromPoll(1,function)")

