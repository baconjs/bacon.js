# build-dependencies: bus
describe "EventStream.doError", ->
  it "calls function before sending error to listeners", ->
    called = []
    bus = new Bacon.Bus()
    s = bus.flatMap((x) -> new Bacon.Error(1)).doError((x) -> called.push(x))
    s.onValue(->)
    s.onError(->)
    bus.push(1)
    expect(called).to.deep.equal([1])
  describe "does not alter the stream", ->
    expectStreamEvents(
      -> series(1, [1, 2]).doError(->)
      [1, 2])
  it "toString", ->
    expect(Bacon.never().doError((->)).toString()).to.equal("Bacon.never().doError(function)")
