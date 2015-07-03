describe "EventStream.bufferWithTime", ->
  describe "returns events in bursts, passing through errors", ->
    expectStreamEvents(
      -> series(2, [error(), 1, 2, 3, 4, 5, 6, 7]).bufferWithTime(t(7))
      [error(), [1, 2, 3, 4], [5, 6, 7]])
  describe "keeps constant output rate even when input is sporadical", ->
    expectStreamTimings(
      -> atGivenTimes([[0, "a"], [3, "b"], [5, "c"]]).bufferWithTime(t(2))
      [[2, ["a"]], [4, ["b"]], [6, ["c"]]]
      semiunstable
    )
  describe "works with empty stream", ->
    expectStreamEvents(
      -> Bacon.never().bufferWithTime(t(1))
      [])
  describe "allows custom defer-function", ->
    fast = (f) -> sc.setTimeout(f, 0)
    expectStreamTimings(
      -> atGivenTimes([[0, "a"], [2, "b"]]).bufferWithTime(fast)
      [[0, ["a"]], [2, ["b"]]], semiunstable)
  describe "works with synchronous defer-function", ->
    sync = (f) -> f()
    expectStreamTimings(
      -> atGivenTimes([[0, "a"], [2, "b"]]).bufferWithTime(sync)
      [[0, ["a"]], [2, ["b"]]], semiunstable)
  describe "works with synchronous source", ->
    expectStreamEvents(
      -> series(2, [1,2,3]).bufferWithTime(t(7))
      [[1,2,3]])
  it "toString", ->
    expect(Bacon.never().bufferWithTime(1).toString()).to.equal("Bacon.never().bufferWithTime(1)")

describe "EventStream.bufferWithCount", ->
  describe "returns events in chunks of fixed size, passing through errors", ->
    expectStreamEvents(
      -> series(1, [1, 2, 3, error(), 4, 5]).bufferWithCount(2)
      [[1, 2], error(), [3, 4], [5]])
  describe "works with synchronous source", ->
    expectStreamEvents(
      -> fromArray([1,2,3,4,5]).bufferWithCount(2)
      [[1, 2], [3, 4], [5]])
  it "toString", ->
    expect(Bacon.never().bufferWithCount(1).toString()).to.equal("Bacon.never().bufferWithCount(1)")

describe "EventStream.bufferWithTimeOrCount", ->
  describe "flushes on count", ->
    expectStreamEvents(
      -> series(1, [1, 2, 3, error(), 4, 5]).bufferWithTimeOrCount(t(10), 2)
      [[1, 2], error(), [3, 4], [5]])
  describe "flushes on timeout", ->
    expectStreamEvents(
      -> series(2, [error(), 1, 2, 3, 4, 5, 6, 7]).bufferWithTimeOrCount(t(7), 10)
      [error(), [1, 2, 3, 4], [5, 6, 7]])
  describe "flushes correctly when scheduled and count-based times overlap", ->
    expectStreamEvents(
      -> take(3, repeatedly(1, [1,2,3,4,5]).bufferWithTimeOrCount(5, 5))
      [[1,2,3,4,5],[1,2,3,4],[5, 1,2,3,4]], semiunstable)

  it "toString", ->
    expect(Bacon.never().bufferWithTimeOrCount(1, 2).toString()).to.equal("Bacon.never().bufferWithTimeOrCount(1,2)")

