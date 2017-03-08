# build-dependencies: bus, merge
describe "EventStream.flatScan", ->
  addAsync = (delay) -> (prev, next) -> later(delay, prev + next)
  describe "accumulates values with given seed and accumulator function which returns a stream of updated values", ->
    expectPropertyEvents(
      -> series(1, [1, 2, error(), 3]).flatScan(0, addAsync 1)
      [0, 1, 3, error(), 6])

  describe "Serializes updates even when they occur while performing previous update", ->
    expectPropertyEvents(
      -> series(1, [1, 2, error(), 3]).flatScan(0, addAsync 5)
      [0, error(), 1, 3, 6], semiunstable)

  describe "Works also when f returns a constant value instead of an EventStream", ->
    expectPropertyEvents(
      -> series(1, [1, 2, error(), 3]).flatScan(0, add)
      [0, 1, 3, error(), 6], semiunstable)

  describe "Works also when f returns a Property instead of an EventStream", ->
    expectPropertyEvents(
      -> series(1, [1, 2, error(), 3]).flatScan(0, (prev, next) -> Bacon.constant(prev + next))
      [0, 1, 3, error(), 6], semiunstable)

  it "yields the seed value immediately", ->
    outputs = []
    Bacon.Bus().flatScan(0, -> 1).onValue((value) -> outputs.push(value))
    expect(outputs).to.deep.equal([0])
