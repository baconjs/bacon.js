# build-dependencies: map
#
describe "EventStream.flatMapLatest", ->
  describe "spawns new streams but collects values from the latest spawned stream only", ->
    expectStreamEvents(
      -> series(3, [1, 2]).flatMapLatest (value) ->
        series(t(2), [value, error(), value])
      [1, 2, error(), 2], semiunstable)
  describe "Accepts a constant EventStream/Property as an alternative to a function", ->
    expectStreamEvents(
      -> Bacon.once("asdf").flatMapLatest(Bacon.constant("bacon"))
      ["bacon"], semiunstable)
  describe "Accepts a field extractor string instead of function", ->
    expectStreamEvents(
      -> Bacon.once({ bacon: Bacon.once("sir francis")}).flatMapLatest(".bacon")
      ["sir francis"])
    expectStreamEvents(
      -> Bacon.once({ bacon: "sir francis"}).flatMapLatest(".bacon")
      ["sir francis"])
  it "toString", ->
    expect(Bacon.never().flatMapLatest(->).toString()).to.equal("Bacon.never().flatMapLatest(function)")

describe "Property.flatMapLatest", ->
  describe "spawns new streams but collects values from the latest spawned stream only", ->
    expectStreamEvents(
      -> series(3, [1, 2]).toProperty(0).flatMapLatest (value) ->
        series(t(2), [value, value])
      [0, 1, 2, 2], semiunstable)
  describe "Accepts a constant EventStream/Property as an alternative to a function", ->
    expectStreamEvents(
      -> Bacon.constant("asdf").flatMapLatest(Bacon.constant("bacon"))
      ["bacon"], semiunstable)
  it "toString", ->
    expect(Bacon.constant(1).flatMapLatest(->).toString()).to.equal("Bacon.constant(1).flatMapLatest(function)")

