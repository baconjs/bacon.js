# build-dependencies: eventstream, property
#
describe "EventStream.skipDuplicates", ->
  describe "drops duplicates", ->
    expectStreamEvents(
      -> series(1, [1, 2, error(), 2, 3, 1]).skipDuplicates()
    [1, 2, error(), 3, 1])

  describe "allows undefined as initial value", ->
    expectStreamEvents(
      -> series(1, [undefined, undefined, 1, 2]).skipDuplicates()
    [undefined, 1, 2])

  describe "works with custom isEqual function", ->
    a = {x: 1}; b = {x: 2}; c = {x: 2}; d = {x: 3}; e = {x: 1}
    isEqual = (a, b) -> a?.x == b?.x
    expectStreamEvents(
      -> series(1, [a, b, error(), c, d, e]).skipDuplicates(isEqual)
      [a, b, error(), d, e])

  describe "works with synchrounous sources", ->
    expectStreamEvents(
      -> fromArray([1, 2, 2, 3, 1]).skipDuplicates()
    [1, 2, 3, 1], semiunstable)
  
  it "toString", ->
    expect(Bacon.never().skipDuplicates().toString()).to.equal("Bacon.never().skipDuplicates()")


describe "Property.skipDuplicates", ->
  describe "drops duplicates", ->
    expectPropertyEvents(
      -> series(1, [1, 2, error(), 2, 3, 1]).toProperty(0).skipDuplicates()
    [0, 1, 2, error(), 3, 1])
