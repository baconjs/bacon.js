# build-dependencies: concat

describe "EventStream.flatMapFirst", ->
  describe "spawns new streams and ignores source events until current spawned stream has ended", ->
    expectStreamEvents(
      -> series(2, [2, 4, 6, 8]).flatMapFirst (value) ->
        series(1, ["a" + value, "b" + value, "c" + value])
      ["a2", "b2", "c2", "a6", "b6", "c6"], semiunstable)
  describe "Accepts a field extractor string instead of function", ->
    expectStreamEvents(
      -> Bacon.once({ bacon: Bacon.once("sir francis")}).flatMapFirst(".bacon")
      ["sir francis"])
    expectStreamEvents(
      -> Bacon.once({ bacon: "sir francis"}).flatMapFirst(".bacon")
      ["sir francis"])
  it "toString", ->
    expect(Bacon.never().flatMapFirst(->).toString()).to.equal("Bacon.never().flatMapFirst(function)")
