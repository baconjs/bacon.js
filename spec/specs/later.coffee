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
