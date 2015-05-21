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
  describe "Allows wrapped events, for instance, Bacon.Error", ->
    expectStreamEvents(
      -> Bacon.fromArray([error(), 1])
      [error(), 1])
  it "doesn't use recursion", ->
    Bacon.fromArray([1..50000]).onValue ->
  it "is synchronous", ->
    counter = 0
    Bacon.fromArray([1..50000]).onValue -> counter++
    expect(counter).to.equal(50000)
  it "toString", ->
    expect(Bacon.fromArray([1,2]).toString()).to.equal("Bacon.fromArray([1,2])")
  it "doesn't mutate the given array, toString works after subscribe (bug fix)", ->
    array = [1,2]
    s = Bacon.fromArray(array)
    s.onValue(->)
    expect(s.toString()).to.equal("Bacon.fromArray([1,2])")
    expect(array).to.deep.equal([1,2])
