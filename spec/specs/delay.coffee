# build-dependencies: takeuntil
describe "EventStream.delay", ->
  describe "delays all events (except errors) by given delay in milliseconds", ->
    expectStreamEvents(
      ->
        left = series(2, [1, 2, 3])
        right = series(1, [error(), 4, 5, 6]).delay(t(6))
        mergeAll(left, right)
      [error(), 1, 2, 3, 4, 5, 6], semiunstable)
  describe "works with synchronous streams", ->
    expectStreamEvents(
      ->
        left = fromArray([1, 2, 3])
        right = fromArray([4, 5, 6]).delay(t(6))
        mergeAll(left, right)
      [1, 2, 3, 4, 5, 6], semiunstable)
  it "toString", ->
    expect(Bacon.never().delay(1).toString()).to.equal("Bacon.never().delay(1)")

describe "Property.delay", ->
  describe "delivers initial value and changes", ->
    expectPropertyEvents(
      -> series(1, [1,2,3]).toProperty(0).delay(t(1))
      [0,1,2,3])
  describe "delays changes", ->
    expectStreamEvents(
      ->
        series(2, [1,2,3])
          .toProperty()
          .delay(t(2)).changes().takeUntil(later(t(5)))
      [1], semiunstable)
  describe "does not delay initial value", ->
    expectPropertyEvents(
      -> series(3, [1]).toProperty(0).delay(1).takeUntil(later(t(2)))
      [0])
  it "toString", ->
    expect(Bacon.constant(0).delay(1).toString()).to.equal("Bacon.constant(0).delay(1)")

