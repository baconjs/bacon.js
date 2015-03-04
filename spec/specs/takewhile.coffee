# build-dependencies: eventstream, property, sample
#
describe "EventStream.takeWhile", ->
  describe "takes while predicate is true", ->
    expectStreamEvents(
      -> repeat(1, [1, error("wat"), 2, 3]).takeWhile(lessThan(3))
      [1, error("wat"), 2])
  describe "extracts field values", ->
    expectStreamEvents(
      ->
        map(series(1, [{good:true, value:"yes"}, {good:false, value:"no"}])
          .takeWhile(".good"), (x) -> x.value)
      ["yes"])
  describe "can filter by Property value", ->
    expectStreamEvents(
      ->
        src = series(1, [1,1,2,3,4,4,8,7])
        odd = map(src, (x) -> x % 2).toProperty()
        src.takeWhile(odd)
      [1,1])
  describe "works with synchronous source", ->
    expectStreamEvents(
      -> fromArray([1, 2, 3]).takeWhile(lessThan(3))
      [1, 2])
  it "toString", ->
    expect(Bacon.never().takeWhile(true).toString()).to.equal("Bacon.never().takeWhile(function)")

describe "Property.takeWhile", ->
  describe "takes while predicate is true", ->
    expectPropertyEvents(
      ->
        series(1, [1, error("wat"), 2, 3])
          .toProperty().takeWhile(lessThan(3))
      [1, error("wat"), 2])
  describe "extracts field values", ->
    expectPropertyEvents(
      ->
        map(series(1, [{good:true, value:"yes"}, {good:false, value:"no"}])
          .toProperty().takeWhile(".good"), (x) -> x.value)
      ["yes"])
  describe "can filter by Property value", ->
    expectPropertyEvents(
      ->
        src = series(1, [1,1,2,3,4,4,8,7]).toProperty()
        odd = map(src, (x) -> x % 2)
        src.takeWhile(odd)
      [1,1])
  describe "works with never-ending Property", ->
    expectPropertyEvents(
      ->
        repeat(1, [1, error("wat"), 2, 3])
          .toProperty().takeWhile(lessThan(3))
      [1, error("wat"), 2])

describe "Observable.takeWhile(EventStream)", ->
  it "should throw an error", ->
    expect(
      -> Bacon.never().takeWhile(Bacon.never())
    ).to.throw(Error, "Observable is not a Property : Bacon.never()")
