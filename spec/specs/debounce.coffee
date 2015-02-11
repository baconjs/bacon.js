describe "EventStream.debounce", ->
  describe "throttles input by given delay, passing-through errors", ->
    expectStreamEvents(
      -> series(2, [1, error(), 2]).debounce(t(7))
      [error(), 2])
  describe "waits for a quiet period before outputing anything", ->
    expectStreamTimings(
      -> series(2, [1, 2, 3, 4]).debounce(t(3))
      [[11, 4]])
  describe "works with synchronous source", ->
    expectStreamEvents(
      -> fromArray([1, 2, 3, 4]).debounce(t(3))
      [4])
  it "toString", ->
    expect(Bacon.never().debounce(1).toString()).to.equal("Bacon.never().debounce(1)")

describe "EventStream.debounceImmediate(delay)", ->
  describe "outputs first event immediately, then ignores events for given amount of milliseconds", ->
    expectStreamTimings(
      -> series(2, [1, 2, 3, 4]).debounceImmediate(t(3))
      [[2, 1], [6, 3]], unstable)
  describe "works with synchronous source", ->
    expectStreamEvents(
      -> fromArray([1, 2, 3, 4]).debounceImmediate(t(3))
      [1])
  it "toString", ->
    expect(Bacon.never().debounceImmediate(1).toString()).to.equal("Bacon.never().debounceImmediate(1)")

describe "Property.debounce", ->
  describe "delivers initial value and changes", ->
    expectPropertyEvents(
      -> series(2, [1,2,3]).toProperty(0).debounce(t(1))
      [0,1,2,3])
  describe "throttles changes, but not initial value", ->
    expectPropertyEvents(
      -> series(1, [1,2,3]).toProperty(0).debounce(t(4))
      [0,3])
  describe "works without initial value", ->
    expectPropertyEvents(
      -> series(2, [1,2,3]).toProperty().debounce(t(4))
      [3])
  describe "works with Bacon.constant (bug fix)", ->
    expectPropertyEvents(
      -> Bacon.constant(1).debounce(1)
      [1])
  it "toString", ->
    expect(Bacon.constant(0).debounce(1).toString()).to.equal("Bacon.constant(0).debounce(1)")
