describe "EventStream.startWith", ->
  describe "provides seed value, then the rest", ->
    expectStreamEvents(
      ->
        left = series(1, [1, 2, 3])
        left.startWith('pow')
      ['pow', 1, 2, 3], semiunstable)
  describe "works with synchronous source", ->
    expectStreamEvents(
      ->
        left = fromArray([1, 2, 3])
        left.startWith('pow')
      ['pow', 1, 2, 3], semiunstable)
  it "toString", ->
    expect(Bacon.never().startWith(0).toString()).to.equal("Bacon.never().startWith(0)")

describe "Property.startWith", ->
  describe "starts with given value if the Property doesn't have an initial value", ->
    expectPropertyEvents(
      ->
        left = series(1, [1, 2, 3]).toProperty()
        left.startWith('pow')
      ['pow', 1, 2, 3], semiunstable)
  describe "works with synchronous source", ->
    expectPropertyEvents(
      ->
        left = fromArray([1, 2, 3]).toProperty()
        left.startWith('pow')
      ['pow', 1, 2, 3], unstable)
  describe "starts with the initial value of the Property if any", ->
    expectPropertyEvents(
      ->
        left = series(1, [1, 2, 3]).toProperty(0)
        left.startWith('pow')
      [0, 1, 2, 3], semiunstable)
  it "toString", ->
    expect(Bacon.constant(2).startWith(1).toString()).to.equal("Bacon.constant(2).startWith(1)")


