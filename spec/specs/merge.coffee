# build-dependencies: scheduled, takeWhile
#
describe "EventStream.merge", ->
  describe "merges two streams and ends when both are exhausted", ->
    expectStreamEvents(
      ->
        left = series(1, [1, error(), 2, 3])
        right = series(1, [4, 5, 6]).delay(t(4))
        left.merge(right)
      [1, error(), 2, 3, 4, 5, 6], unstable)
  describe "respects subscriber return value", ->
    expectStreamEvents(
      ->
        left = take(3, repeat(2, [1, 3]))
        right = take(3, repeat(3, [2]))
        left.merge(right).takeWhile(lessThan(2))
      [1])
  describe "does not duplicate same error from two streams", ->
    expectStreamEvents(
      ->
        src = series(1, [1, error(), 2, error(), 3])
        left = map(src, (x) -> x)
        right = map(src, (x) -> x * 2)
        left.merge(right)
      [1, 2, error(), 2, 4, error(), 3, 6], unstable)
  describe "works with synchronous sources", ->
    expectStreamEvents(
      -> fromArray([1,2]).merge(fromArray([3,4]))
      [1,2,3,4])
  it "toString", ->
    expect(Bacon.once(1).merge(Bacon.once(2)).toString()).to.equal("Bacon.once(1).merge(Bacon.once(2))")

