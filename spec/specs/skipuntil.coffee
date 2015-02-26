# build-dependencies: filter, once
#
describe "EventStream.skipUntil", ->
  describe "skips events until one appears in given starter stream", ->
    expectStreamEvents(
      ->
        src = series(3, [1,2,3])
        src.onValue(->) # to start "time" immediately instead of on subscribe
        starter = series(4, ["start"])
        src.skipUntil(starter)
      [2,3])
  describe "works with self-derived starter", ->
    expectStreamEvents(
      ->
        src = series(3, [1,2,3])
        starter = src.filter((x) -> x == 3)
        src.skipUntil(starter)
      [3])
  describe "works with self-derived starter with an evil twist", ->
    expectStreamEvents(
      ->
        src = series(3, [1,2,3])
        data = map(src, (x) -> x)
        data.onValue(->)
        starter = src.filter((x) -> x == 3)
        data.skipUntil(starter)
      [3])
  it "toString", ->
    expect(Bacon.never().skipUntil(Bacon.once(1)).toString()).to.equal("Bacon.never().skipUntil(Bacon.once(1))")


