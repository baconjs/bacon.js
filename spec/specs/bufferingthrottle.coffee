describe "EventStream.bufferingThrottle(minimumInterval)", ->
  describe "limits throughput but includes all events", ->
    expectStreamTimings(
      -> series(1, [1,2,3]).bufferingThrottle(t(3))
      [[1,1], [4,2], [7,3]], semiunstable)
  it "toString", ->
    expect(Bacon.never().bufferingThrottle(2).toString()).to.equal("Bacon.never().bufferingThrottle(2)")

describe "Property.bufferingThrottle(delay)", ->
  describe "limits throughput but includes all events", ->
    expectStreamTimings(
      -> series(1, [1,2,3]).toProperty().bufferingThrottle(t(3)).changes()
      [[1,1], [4,2], [7,3]], semiunstable)
