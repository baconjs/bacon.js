describe "EventStream.skip", ->
  describe "should skip first N items", ->
    expectStreamEvents(
      -> series(1, [1, error(), 2, error(), 3]).skip(1)
    [error(), 2, error(), 3])
  describe "accepts N <= 0", ->
    expectStreamEvents(
      -> series(1, [1, 2]).skip(-1)
    [1, 2])
  describe "works with synchronous source", ->
    expectStreamEvents(
      -> fromArray([1, 2, 3]).skip(1)
    [2, 3])
  it "toString", ->
    expect(Bacon.never().skip(1).toString()).to.equal("Bacon.never().skip(1)")


