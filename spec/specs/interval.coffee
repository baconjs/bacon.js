describe "Bacon.interval", ->
  describe "repeats single element indefinitely", ->
    expectStreamEvents(
      -> take 3, Bacon.interval(t(1), "x")
      ["x", "x", "x"])
  it "toString", ->
    expect(Bacon.interval(1, 2).toString()).to.equal("Bacon.interval(1,2)")
