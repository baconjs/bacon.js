# build-dependencies: eventstream
describe "EventStream.mapEnd", ->
  describe "produces an extra element on stream end", ->
    expectStreamEvents(
      -> series(1, ["1", error()]).mapEnd("the end")
      ["1", error(), "the end"])
  describe "accepts either a function or a constant value", ->
    expectStreamEvents(
      -> series(1, ["1", error()]).mapEnd(-> "the end")
      ["1", error(), "the end"])
  describe "works with undefined value as well", ->
    expectStreamEvents(
      -> series(1, ["1", error()]).mapEnd()
      ["1", error(), undefined])
  it "toString", ->
    expect(Bacon.never().mapEnd(true).toString()).to.equal("Bacon.never().mapEnd(function)")
