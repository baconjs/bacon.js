describe "Observable.slidingWindow", ->
  describe "slides the window for EventStreams", ->
    expectPropertyEvents(
      -> series(1, [1,2,3]).slidingWindow(2)
      [[], [1], [1,2], [2,3]])
  describe "slides the window for Properties", ->
    expectPropertyEvents(
      -> series(1, [1,2,3]).toProperty().slidingWindow(2)
      [[], [1], [1,2], [2,3]])
  describe "accepts second parameter for minimum amount of values", ->
    expectPropertyEvents(
      -> series(1, [1,2,3,4]).slidingWindow(3, 2)
      [[1,2], [1,2,3], [2,3,4]])
    expectPropertyEvents(
      -> series(1, [1,2,3,4]).toProperty(0).slidingWindow(3, 2)
      [[0,1], [0, 1, 2], [1,2,3], [2,3,4]])
  it "toString", ->
    expect(Bacon.never().slidingWindow(2).toString()).to.equal("Bacon.never().slidingWindow(2,0)")

