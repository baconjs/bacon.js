# build-dependencies: EventStream, Property, sample, delay
#
describe "EventStream.filter", ->
  describe "should filter values", ->
    expectStreamEvents(
      -> series(1, [1, 2, error(), 3]).filter(lessThan(3))
      [1, 2, error()])
  describe "extracts field values", ->
    expectStreamEvents(
      -> map(series(1, [{good:true, value:"yes"}, {good:false, value:"no"}]).filter(".good"), (x) -> x.value)
      ["yes"])
  describe "can filter by Property value", ->
    expectStreamEvents(
      ->
        src = series(1, [1,1,2,3,4,4,8,7])
        odd = map(src, (x) -> x % 2).toProperty()
        src.filter(odd)
      [1,1,3,7])
  it "toString", ->
    expect(Bacon.never().filter(false).toString()).to.equal("Bacon.never().filter(function)")

describe "Property.filter", ->
  describe "should filter values", ->
    expectPropertyEvents(
      -> series(1, [1, error(), 2, 3]).toProperty().filter(lessThan(3))
      [1, error(), 2])
  it "preserves old current value if the updated value is non-matching", ->
    p = fromArray([1,2]).toProperty().filter(lessThan(2))
    p.onValue(=>) # to ensure that property is actualy updated
    values = []
    p.onValue((v) => values.push(v))
    expect(values).to.deep.equal([1])
  describe "can filter by Property value", ->
    expectPropertyEvents(
      ->
        src = series(2, [1, 2, 3, 4]).delay(t(1)).toProperty()
        ok = series(2, [false, true, true, false]).toProperty()
        src.filter(ok)
      [2, 3])

describe "Observable.filter(EventStream)", ->
  it "should throw an error", ->
    expect(
      -> once(true).filter(once(true))
    ).to.throw(Error, "Observable is not a Property : Bacon.once(true)")
