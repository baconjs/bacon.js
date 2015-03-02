describe "Bacon.fromArray", ->
  describe "Turns an empty array into an EventStream", ->
    expectStreamEvents(
      -> Bacon.fromArray([])
      [])
  describe "Turns a single-element array into an EventStream", ->
    expectStreamEvents(
      -> Bacon.fromArray([1])
      [1])
  describe "Turns a longer array into an EventStream", ->
    expectStreamEvents(
      -> Bacon.fromArray([1, 2, 3])
      [1, 2, 3])
  it "toString", ->
    expect(Bacon.fromArray([1,2]).toString()).to.equal("Bacon.fromArray([1,2])")

describe "Bacon.fromArraySync", ->
  describe "Turns an empty array into an EventStream", ->
    expectStreamEvents(
      -> Bacon.fromArraySync([])
      [])
  describe "Turns a single-element array into an EventStream", ->
    expectStreamEvents(
      -> Bacon.fromArraySync([1])
      [1])
  describe "Turns a longer array into an EventStream", ->
    expectStreamEvents(
      -> Bacon.fromArraySync([1, 2, 3])
      [1, 2, 3])
  describe "Allows wrapped events, for instance, Bacon.Error", ->
    expectStreamEvents(
      -> Bacon.fromArraySync([error(), 1])
      [error(), 1])
  it "toString", ->
    expect(Bacon.fromArraySync([1,2]).toString()).to.equal("Bacon.fromArraySync([1,2])")
  it "doesn't mutate the given array, toString works after subscribe (bug fix)", ->
    array = [1,2]
    s = Bacon.fromArraySync(array)
    s.onValue(->)
    expect(s.toString()).to.equal("Bacon.fromArraySync([1,2])")
    expect(array).to.deep.equal([1,2])
