# build-dependencies: EventStream, Property, sample, skip
#
describe "Property.map", ->
  describe "maps property values", ->
    expectPropertyEvents(
      ->
        series(1, [2, new Bacon.Error()]).toProperty(1).map(times, 2)
      [2, 4, error()])

describe "EventStream.map", ->
  describe "should map with given function", ->
    expectStreamEvents(
      -> series(1, [1, 2, 3]).map(times, 2)
      [2, 4, 6])
  describe "also accepts a constant value", ->
    expectStreamEvents(
      -> series(1, [1, 2, 3,]).map("lol")
      ["lol", "lol", "lol"])
  describe "extracts property from value object", ->
    o = { lol : "wut" }
    expectStreamEvents(
      -> take(3, repeat(1, [o])).map(".lol")
      ["wut", "wut", "wut"])
  describe "extracts a nested property too", ->
    o = { lol : { wut : "wat" } }
    expectStreamEvents(
      -> once(o).map(".lol.wut")
      ["wat"])
  describe "in case of a function property, calls the function with no args", ->
    expectStreamEvents(
      -> once([1,2,3]).map(".length")
      [3])
  describe "allows arguments for methods", ->
    thing = { square: (x) -> x * x }
    expectStreamEvents(
      -> once(thing).map(".square", 2)
      [4])
  describe "works with method call on given object, with partial application", ->
    multiplier = { multiply: (x, y) -> x * y }
    expectStreamEvents(
      -> series(1, [1,2,3]).map(multiplier, "multiply", 2)
      [2,4,6])
  describe "can map to a Property value", ->
    expectStreamEvents(
      -> series(1, [1,2,3]).map(Bacon.constant(2))
      [2,2,2])
  it "preserves laziness", ->
    calls = 0
    id = (x) ->
      calls++
      x
    fromArray([1,2,3,4,5]).map(id).skip(4).onValue()
    expect(calls).to.equal(1)
  it "toString", ->
    expect(Bacon.never().map(true).toString()).to.equal("Bacon.never().map(function)")

  describe "Field value extraction", ->
    describe "extracts field value", ->
      expectStreamEvents(
        -> once({lol:"wut"}).map(".lol")
        ["wut"])
    describe "extracts nested field value", ->
      expectStreamEvents(
        -> once({lol:{wut: "wat"}}).map(".lol.wut")
        ["wat"])
    describe "yields 'undefined' if any value on the path is 'undefined'", ->
      expectStreamEvents(
        -> once({}).map(".lol.wut")
        [undefined])
    it "if field value is method, it does a method call", ->
      context = null
      result = null
      object = {
        method: ->
          context = this
          "result"
      }
      once(object).map(".method").onValue((x) -> result = x)
      expect(result).to.deep.equal("result")
      expect(context).to.deep.equal(object)

