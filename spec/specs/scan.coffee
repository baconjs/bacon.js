# build-dependencies: bus, merge

describe "EventStream.scan", ->
  describe "accumulates values with given seed and accumulator function, passing through errors", ->
    expectPropertyEvents(
      -> series(1, [1, 2, error(), 3]).scan(0, add)
      [0, 1, 3, error(), 6])
  describe "also works with method name", ->
    expectPropertyEvents(
      -> series(1, [[1], [2]]).scan([], ".concat")
      [[], [1], [1, 2]])
  it "yields the seed value immediately", ->
    outputs = []
    bus = new Bacon.Bus()
    bus.scan(0, -> 1).onValue((value) -> outputs.push(value))
    expect(outputs).to.deep.equal([0])
  describe "yields null seed value", ->
    expectPropertyEvents(
      -> series(1, [1]).scan(null, ->1)
      [null, 1])
  describe "works with synchronous streams", ->
    expectPropertyEvents(
      -> fromArray([1,2,3]).scan(0, ((x,y)->x+y))
      [0,1,3,6], unstable)
  describe "works with merged synchronous streams", ->
    expectPropertyEvents(
      -> Bacon.mergeAll(once(1), once(2)).scan(0, (a,b) -> a+b)
      [0,1,3], unstable)
  describe "calls accumulator function once per value", ->
    describe "(simple case)", ->
      count = 0
      expectPropertyEvents(
        -> series(2, [1,2,3]).scan(0, (x,y) -> count++; x + y)
        [0, 1, 3, 6]
        { extraCheck: -> it "calls accumulator once per value", -> expect(count).to.equal(3)}
      )
    it "(when pushing to Bus in accumulator)", ->
      count = 0
      someBus = new Bacon.Bus()
      someBus.onValue ->
      src = new Bacon.Bus()
      result = src.scan 0, ->
        someBus.push()
        count++
      result.onValue ->
      result.onValue ->
      src.push()
      expect(count).to.equal(1)

describe "Property.scan", ->
  describe "with Init value, starts with f(seed, init)", ->
    expectPropertyEvents(
      -> series(1, [2,3]).toProperty(1).scan(0, add)
      [1, 3, 6])
  describe "without Init value, starts with seed", ->
    expectPropertyEvents(
      -> series(1, [2,3]).toProperty().scan(0, add)
      [0, 2, 5])
  describe "treats null seed value like any other value", ->
    expectPropertyEvents(
      -> series(1, [1]).toProperty().scan(null, add)
      [null, 1])
    expectPropertyEvents(
      -> series(1, [2]).toProperty(1).scan(null, add)
      [1, 3])
  describe "for synchronous source", ->
    describe "with Init value, starts with f(seed, init)", ->
      expectPropertyEvents(
        -> fromArray([2,3]).toProperty(1).scan(0, add)
        [1, 3, 6], unstable)
    describe "without Init value, starts with seed", ->
      expectPropertyEvents(
        -> fromArray([2,3]).toProperty().scan(0, add)
        [0, 2, 5], unstable)
    describe "works with synchronously responding empty source", ->
      expectPropertyEvents(
        -> Bacon.never().toProperty(1).scan(0, add)
        [1])
