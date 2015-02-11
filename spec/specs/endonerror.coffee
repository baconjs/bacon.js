describe "EventStream.endOnError", ->
  describe "terminates on error", ->
    expectStreamEvents(
      -> repeat(1, [1, 2, error(), 3]).endOnError()
      [1, 2, error()])
  describe "accepts predicate function", ->
    expectStreamEvents(
      -> series(1, [1, 2, error(), 3, new Bacon.Error({serious:true}), 4]).endOnError((e) -> e?.serious)
      [1,2,error(),3,error()])
  describe "accepts extractor string", ->
    expectStreamEvents(
      -> series(1, [1, 2, error(), 3, new Bacon.Error({serious:true}), 4]).endOnError(".serious")
      [1,2,error(),3,error()])
  describe "works with synchronous source", ->
    expectStreamEvents(
      -> fromArray([1, 2, error(), 3]).endOnError()
      [1, 2, error()])
  it "toString", ->
    expect(Bacon.never().endOnError().toString()).to.equal("Bacon.never().endOnError()")

describe "Property.endOnError", ->
  describe "terminates on Error", ->
    expectPropertyEvents(
      -> series(2, [1, error(), 2]).toProperty().endOnError()
      [1, error()])
