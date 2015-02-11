# build-dependencies: eventstream

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

describe "Property.toEventStream", ->
  describe "creates a stream that starts with current property value", ->
    expectStreamEvents(
      -> series(1, [1, 2]).toProperty(0).toEventStream()
      [0, 1, 2], unstable)
  describe "works with synchronous source", ->
    expectStreamEvents(
      -> fromArray([1, 2]).toProperty(0).toEventStream()
      [0, 1, 2], unstable)

describe "Property.toProperty", ->
  describe "returns the same Property", ->
    expectPropertyEvents(
      -> Bacon.constant(1).toProperty()
      [1])
  it "rejects arguments", ->
    try
      Bacon.constant(1).toProperty(0)
      fail()
    catch e

