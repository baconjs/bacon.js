# build-dependencies: take, interval, delay

describe "Property.sampledBy(stream)", ->
  describe "samples property at events, resulting to EventStream", ->
    expectStreamEvents(
      ->
        prop = series(2, [1, 2]).toProperty()
        stream = repeat(3, ["troll"]).take(4)
        prop.sampledBy(stream)
      [1, 2, 2, 2])
  describe "includes errors from both Property and EventStream", ->
    expectStreamEvents(
      ->
        prop = series(2, [error(), 2]).toProperty()
        stream = series(3, [error(), "troll"])
        prop.sampledBy(stream)
      [error(), error(), 2])
  describe "ends when sampling stream ends", ->
    expectStreamEvents(
      ->
        prop = repeat(2, [1, 2]).toProperty()
        stream = repeat(2, [""]).delay(t(1)).take(4)
        prop.sampledBy(stream)
      [1, 2, 1, 2])
  describe "accepts optional combinator function f(Vp, Vs)", ->
    expectStreamEvents(
      ->
        prop = series(2, ["a", "b"]).toProperty()
        stream = series(2, ["1", "2", "1", "2"]).delay(t(1))
        prop.sampledBy(stream, add)
      ["a1", "b2", "b1", "b2"])
  describe "allows method name instead of function too", ->
    expectStreamEvents(
      ->
        Bacon.constant([1]).sampledBy(Bacon.once([2]), ".concat")
      [[1, 2]])
  describe "works with same origin", ->
    expectStreamEvents(
      ->
        src = series(2, [1, 2])
        src.toProperty().sampledBy(src)
      [1, 2])
    expectStreamEvents(
      ->
        src = series(2, [1, 2])
        src.toProperty().sampledBy(src.map(times, 2))
      [1, 2])
  describe "skips samplings that occur before the property gets its first value", ->
    expectStreamEvents(
      ->
        p = series(5, [1]).toProperty()
        p.sampledBy(series(3, [0]))
      [])
    expectStreamEvents(
      ->
        p = series(5, [1, 2]).toProperty()
        p.sampledBy(series(3, [0, 0, 0, 0]))
      [1, 1, 2], semiunstable)
    expectPropertyEvents(
      ->
        p = series(5, [1, 2]).toProperty()
        p.sampledBy(series(3, [0, 0, 0, 0]).toProperty())
      [1, 1, 2], semiunstable)
  describe "works with stream of functions", ->
    f = ->
    expectStreamEvents(
      ->
        p = series(1, [f]).toProperty()
        p.sampledBy(series(1, [1, 2, 3]))
      [f, f, f])
  describe "works with synchronous sampler stream", ->
    expectStreamEvents(
      -> Bacon.constant(1).sampledBy(fromArray([1,2,3]))
      [1,1,1], semiunstable)
    expectStreamEvents(
      -> later(1, 1).toProperty().sampledBy(fromArray([1,2,3]))
      [])
  describe "laziness", ->
    calls = 0
    before (done) ->
      id = (x) ->
        calls++
        x
      sampler = later(5).map(id)
      property = repeat(1, [1]).toProperty().map(id)
      sampled = property.sampledBy sampler
      sampled.onValue()
      sampled.onEnd(done)
    it "preserves laziness", ->
      expect(calls).to.equal(1)
  it "toString", ->
    expect(Bacon.constant(0).sampledBy(Bacon.never()).toString()).to.equal("Bacon.constant(0).sampledBy(Bacon.never(),function)")

describe "Property.sampledBy(property)", ->
  describe "samples property at events, resulting to a Property", ->
    expectPropertyEvents(
      ->
        prop = series(2, [1, 2]).toProperty()
        sampler = repeat(3, ["troll"]).take(4).toProperty()
        prop.sampledBy(sampler)
      [1, 2, 2, 2])
  describe "works on an event stream by automatically converting to property", ->
    expectPropertyEvents(
      ->
        stream = series(2, [1, 2])
        sampler = repeat(3, ["troll"]).take(4).toProperty()
        stream.sampledBy(sampler)
      [1, 2, 2, 2])
  describe "accepts optional combinator function f(Vp, Vs)", ->
    expectPropertyEvents(
      ->
        prop = series(2, ["a", "b"]).toProperty()
        sampler = series(2, ["1", "2", "1", "2"]).delay(t(1)).toProperty()
        prop.sampledBy(sampler, add)
      ["a1", "b2", "b1", "b2"])

describe "Property.sample", ->
  describe "samples property by given interval", ->
    expectStreamEvents(
      ->
        prop = series(2, [1, 2]).toProperty()
        prop.sample(t(3)).take(4)
      [1, 2, 2, 2])
  describe "includes all errors", ->
    expectStreamEvents(
      ->
        prop = series(2, [1, error(), 2]).toProperty()
        prop.sample(t(5)).take(2)
      [error(), 1, 2], semiunstable)
  describe "works with synchronous source", ->
    expectStreamEvents(
      ->
        prop = Bacon.constant(1)
        prop.sample(t(3)).take(4)
      [1, 1, 1, 1])
  it "toString", ->
    expect(Bacon.constant(0).sample(1).toString()).to.equal("Bacon.constant(0).sample(1)")


