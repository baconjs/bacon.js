describe "Bacon.constant", ->
  describe "creates a constant property", ->
    expectPropertyEvents(
      -> Bacon.constant("lol")
    ["lol"])
  it "ignores unsubscribe", ->
    Bacon.constant("lol").onValue(=>)()
  describe "provides same value to all listeners", ->
    c = Bacon.constant("lol")
    expectPropertyEvents((-> c), ["lol"])
    it "check check", ->
      f = mockFunction()
      c.onValue(f)
      f.verify("lol")
  it "provides same value to all listeners, when mapped (bug fix)", ->
    c = map(Bacon.constant("lol"), id)
    f = mockFunction()
    c.onValue(f)
    f.verify("lol")
    c.onValue(f)
    f.verify("lol")
  it "toString", ->
    expect(Bacon.constant(1).toString()).to.equal("Bacon.constant(1)")
