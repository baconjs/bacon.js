# build-dependencies: bus
describe "EventStream.doAction", ->
  it "calls function before sending value to listeners", ->
    called = []
    bus = new Bacon.Bus()
    s = bus.doAction((x) -> called.push(x))
    s.onValue(->)
    s.onValue(->)
    bus.push(1)
    expect(called).to.deep.equal([1])
  describe "does not alter the stream", ->
    expectStreamEvents(
      -> series(1, [1, 2]).doAction(->)
      [1, 2])
  it "toString", ->
    expect(Bacon.never().doAction((->)).toString()).to.equal("Bacon.never().doAction(function)")
