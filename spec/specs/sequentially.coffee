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
          throw "testing" # special string that will be catched by TickScheduler
        s
      ["lol", "wut"], unstable)
  it "toString", ->
    expect(Bacon.sequentially(1, [2]).toString()).to.equal("Bacon.sequentially(1,[2])")
