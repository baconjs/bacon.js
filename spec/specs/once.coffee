describe "Bacon.once", ->
  describe "should send single event and end", ->
    expectStreamEvents(
      -> Bacon.once("pow")
      ["pow"])
  describe "accepts an Error event as parameter", ->
    expectStreamEvents(
      -> Bacon.once(new Bacon.Error("oop"))
      [error()])
  describe "Allows wrapped events, for instance, Bacon.Error", ->
    expectStreamEvents(
      -> Bacon.once(error())
      [error()])
  it "Responds asynchronously", ->
    values = []
    s = Bacon.once(1)
    s.onValue(values.push.bind(values))
    expect(values).to.deep.equal([])

describe "Bacon.immediately", ->
  describe "should send single event and end", ->
    expectStreamEvents(
      -> Bacon.immediately("pow")
      ["pow"])
  describe "accepts an Error event as parameter", ->
    expectStreamEvents(
      -> Bacon.immediately(new Bacon.Error("oop"))
      [error()])
  describe "Allows wrapped events, for instance, Bacon.Error", ->
    expectStreamEvents(
      -> Bacon.immediately(error())
      [error()])
  it "Responds synchronously", ->
    values = []
    s = Bacon.immediately(1)
    s.onValue(values.push.bind(values))
    expect(values).to.deep.equal([1])
    s.onValue(values.push.bind(values))
    expect(values).to.deep.equal([1])
  it "toString", ->
    expect(Bacon.immediately(1).toString()).to.equal("Bacon.immediately(1)")
