# build-dependencies: property, eventstream, sample
#
describe "EventStream.skipWhile", ->
  describe "skips filter predicate holds true", ->
    expectStreamEvents(
      -> series(1, [1, error(), 2, error(), 3, 2]).skipWhile(lessThan(3))
      [error(), error(), 3, 2])
  describe "extracts field values", ->
    expectStreamEvents(
      ->
        series(1, [{good:true, value:"yes"}, {good:false, value:"no"}])
          .skipWhile(".good").map(".value")
      ["no"])
  describe "can filter by Property value", ->
    expectStreamEvents(
      ->
        src = series(1, [1,1,2,3,4,4,8,7])
        odd = src.map((x) -> x % 2).toProperty()
        src.skipWhile(odd)
      [2,3,4,4,8,7])
  describe "for synchronous sources", ->
    describe "skips filter predicate holds true", ->
      expectStreamEvents(
        -> fromArray([1, 2, 3, 2]).skipWhile(lessThan(3))
        [3, 2])
  it "toString", ->
    expect(Bacon.never().skipWhile(1).toString()).to.equal("Bacon.never().skipWhile(function)")

describe "Observable.skipWhile(EventStream)", ->
  it "should throw an error", ->
    expect(
      -> Bacon.never().skipWhile(Bacon.never())
    ).to.throw(Error, "Observable is not a Property : Bacon.never()")
