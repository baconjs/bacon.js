# build-dependencies: takeWhile, delay
#
describe "EventStream.merge", ->
  describe "merges two streams and ends when both are exhausted", ->
    expectStreamEvents(
      ->
        left = series(1, [1, error(), 2, 3])
        right = series(1, [4, 5, 6]).delay(t(4))
        left.merge(right)
      [1, error(), 2, 3, 4, 5, 6], semiunstable)
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
    expect(Bacon.never(1).merge(Bacon.never()).toString()).to.equal("Bacon.never().merge(Bacon.never())")

describe "Bacon.mergeAll", ->
  describe ("merges all given streams"), ->
    expectStreamEvents(
      ->
        Bacon.mergeAll([
          series(3, [1, 2])
          series(3, [3, 4]).delay(t(1))
          series(3, [5, 6]).delay(t(2))])
      [1, 3, 5, 2, 4, 6], semiunstable)
  describe ("supports n-ary syntax"), ->
    expectStreamEvents(
      ->
        Bacon.mergeAll(
          series(3, [1, 2])
          series(3, [3, 4]).delay(t(1))
          series(3, [5, 6]).delay(t(2)))
      [1, 3, 5, 2, 4, 6], semiunstable)
  describe "works with a single stream", ->
    expectStreamEvents(
      -> Bacon.mergeAll([once(1)])
      [1])
    expectStreamEvents(
      -> Bacon.mergeAll(once(1))
      [1])
  describe "returns empty stream for zero input", ->
    expectStreamEvents(
      -> Bacon.mergeAll([])
      [])
    expectStreamEvents(
      -> Bacon.mergeAll()
      [])
  it "toString", ->
    expect(Bacon.mergeAll(Bacon.never()).toString()).to.equal("Bacon.mergeAll(Bacon.never())")

