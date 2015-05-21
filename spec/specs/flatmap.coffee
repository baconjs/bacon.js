# build-dependencies: concat
#
describe "EventStream.flatMap", ->
  describe "should spawn new stream for each value and collect results into a single stream", ->
    expectStreamEvents(
      -> series(1, [1, 2]).flatMap (value) ->
        series(t(2), [value, error(), value])
      [1, 2, error(), error(), 1, 2], semiunstable)
  describe "should pass source errors through to the result", ->
    expectStreamEvents(
      -> series(1, [error(), 1]).flatMap (value) ->
        later(t(1), value)
      [error(), 1])
  describe "should work with a spawned stream responding synchronously", ->
    expectStreamEvents(
      -> series(1, [1, 2]).flatMap (value) ->
         Bacon.never().concat(Bacon.once(value))
      [1, 2], unstable)
    expectStreamEvents(
      -> series(1, [1,2]).flatMap (value) ->
         Bacon.never().concat(Bacon.once(value)).concat(Bacon.once("lol"))
      [1, "lol", 2, "lol"], unstable)
  describe "should work with a source stream responding synchronously", ->
    expectStreamEvents(
      -> fromArray([1, 2]).flatMap (value) ->
         Bacon.once(value)
      [1, 2], semiunstable)
    expectStreamEvents(
      -> fromArray([1, 2]).flatMap (value) ->
         fromArray([value, value*10])
      [1, 10, 2, 20], semiunstable)
    expectStreamEvents(
      -> Bacon.once(1).flatMap (value) ->
         later(0, value)
      [1], semiunstable)
  describe "Works also when f returns a Property instead of an EventStream", ->
    expectStreamEvents(
      -> series(1, [1,2]).flatMap(Bacon.constant)
      [1,2], semiunstable)
  describe "Works also when f returns a constant value instead of an EventStream", ->
    expectStreamEvents(
      -> series(1, [1,2]).flatMap((x) -> x)
      [1,2], semiunstable)
  describe "Works also when f returns an Error instead of an EventStream", ->
    expectStreamEvents(
      -> series(1, [1,2]).flatMap((x) -> new Bacon.Error(x))
      [new Bacon.Error(1), new Bacon.Error(2)], semiunstable)
  describe "Accepts a constant EventStream/Property as an alternative to a function", ->
    expectStreamEvents(
      -> Bacon.once("asdf").flatMap(Bacon.constant("bacon"))
      ["bacon"])
    expectStreamEvents(
      -> Bacon.once("asdf").flatMap(Bacon.once("bacon"))
      ["bacon"])
  describe "Respects function construction rules", ->
    expectStreamEvents(
      -> Bacon.once({ bacon: Bacon.once("sir francis")}).flatMap(".bacon")
      ["sir francis"], semiunstable)
    expectStreamEvents(
      -> Bacon.once({ bacon: "sir francis"}).flatMap(".bacon")
      ["sir francis"], semiunstable)
    expectStreamEvents(
      ->
        glorify = (x, y) -> fromArray([x, y])
        Bacon.once("francis").flatMap(glorify, "sir")
      ["sir", "francis"], semiunstable)
  it "toString", ->
    expect(Bacon.never().flatMap(->).toString()).to.equal("Bacon.never().flatMap(function)")


describe "Property.flatMap", ->
  describe "should spawn new stream for all events including Init", ->
    expectStreamEvents(
      ->
        once = (x) -> Bacon.once(x)
        series(1, [1, 2]).toProperty(0).flatMap(once)
      [0, 1, 2], semiunstable)
  describe "Works also when f returns a Property instead of an EventStream", ->
    expectStreamEvents(
      -> series(1, [1,2]).toProperty().flatMap(Bacon.constant)
      [1,2], semiunstable)
    expectPropertyEvents(
      -> series(1, [1,2]).toProperty().flatMap(Bacon.constant).toProperty()
      [1,2], semiunstable)
  describe "works for synchronous source", ->
    expectStreamEvents(
      ->
        once = (x) -> Bacon.once(x)
        fromArray([1, 2]).toProperty(0).flatMap(once)
      [0, 1, 2], unstable)
  it "toString", ->
    expect(Bacon.constant(1).flatMap(->).toString()).to.equal("Bacon.constant(1).flatMap(function)")

describe "EventStream.flatMapFirst", ->
  describe "spawns new streams and ignores source events until current spawned stream has ended", ->
    expectStreamEvents(
      -> series(2, [2, 4, 6, 8]).flatMapFirst (value) ->
        series(1, ["a" + value, "b" + value, "c" + value])
      ["a2", "b2", "c2", "a6", "b6", "c6"], semiunstable)
  describe "Accepts a field extractor string instead of function", ->
    expectStreamEvents(
      -> Bacon.once({ bacon: Bacon.once("sir francis")}).flatMapFirst(".bacon")
      ["sir francis"])
    expectStreamEvents(
      -> Bacon.once({ bacon: "sir francis"}).flatMapFirst(".bacon")
      ["sir francis"])
  it "toString", ->
    expect(Bacon.never().flatMapFirst(->).toString()).to.equal("Bacon.never().flatMapFirst(function)")
