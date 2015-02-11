# build-dependencies: eventstream, mapend, map, merge

describe "Bacon.groupSimultaneous", ->
  describe "groups simultaneous values in to arrays", ->
    expectStreamEvents(
      ->
        src = series(1, [1,2])
        stream = src.merge(src.map((x) -> x * 2))
        Bacon.groupSimultaneous(stream)
      [[[1, 2]], [[2,4]]])
  describe "groups simultaneous values from multiple sources in to arrays", ->
    expectStreamEvents(
      ->
        src = series(1, [1,2])
        stream = src.merge(src.map((x) -> x * 2))
        stream2 = src.map (x) -> x * 4
        Bacon.groupSimultaneous(stream, stream2)
      [[[1, 2], [4]], [[2,4], [8]]])
  describe "accepts an array or multiple args", ->
    expectStreamEvents(
      -> Bacon.groupSimultaneous([later(1, 1), later(2, 2)])
      [[[1],[]], [[], [2]]])
  describe "returns empty stream for zero sources", ->
    expectStreamEvents(
      -> Bacon.groupSimultaneous()
      [])
    expectStreamEvents(
      -> Bacon.groupSimultaneous([])
      [])
  describe "works with synchronous sources", ->
      expectStreamEvents(
        -> Bacon.groupSimultaneous(fromArray([1,2]))
        [[[1]], [[2]]])
      expectStreamEvents(
        -> Bacon.groupSimultaneous(fromArray([1,2]).mapEnd(3))
        [[[1]], [[2]], [[3]]])
  it "toString", ->
    expect(Bacon.groupSimultaneous(Bacon.never()).toString()).to.equal("Bacon.groupSimultaneous(Bacon.never())")


