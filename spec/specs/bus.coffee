# build-dependencies: filter, map

describe "Bacon.Bus", ->
  it "can be instatiated without new", ->
    expect(Bacon.Bus()).to.be.an.instanceof(Bacon.Bus)
  it "merges plugged-in streams", ->
    bus = new Bacon.Bus()
    values = []
    dispose = bus.onValue (value) -> values.push value
    push = new Bacon.Bus()
    bus.plug(push)
    push.push("lol")
    expect(values).to.deep.equal(["lol"])
    dispose()
    verifyCleanup()
  describe "works with looped streams", ->
    expectStreamEvents(
      ->
        bus = new Bacon.Bus()
        bus.plug(later(t(2), "lol"))
        bus.plug(bus.filter((value) => "lol" == value).map(=> "wut"))
        later(t(4)).onValue(=> bus.end())
        bus
      ["lol", "wut"], unstable)
  it "dispose works with looped streams", ->
    bus = new Bacon.Bus()
    bus.plug(later(t(2), "lol"))
    bus.plug(bus.filter((value) => "lol" == value).map(=> "wut"))
    dispose = bus.onValue(=>)
    dispose()
  it "Removes input from input list on End event", ->
    subscribed = 0
    bus = new Bacon.Bus()
    input = new Bacon.Bus()
    # override subscribe to increase the subscribed-count
    inputSubscribe = input.dispatcher.subscribe
    input.dispatcher.subscribe = (sink) ->
      subscribed++
      inputSubscribe.call(input, sink)
    bus.plug(input)
    dispose = bus.onValue(=>)
    input.end()
    dispose()
    bus.onValue(=>) # this latter subscription should not go to the ended source anymore
    expect(subscribed).to.deep.equal(1)
  it "unsubscribes inputs on end() call", ->
    bus = new Bacon.Bus()
    input = new Bacon.Bus()
    events = []
    bus.plug(input)
    bus.subscribe((e) => events.push(e))
    input.push("a")
    bus.end()
    input.push("b")
    expect(toValues(events)).to.deep.equal(["a", "<end>"])
  it "handles cold single-event streams correctly (bug fix)", ->
    values = []
    bus = new Bacon.Bus()
    bus.plug(once("x"))
    bus.plug(once("y"))
    bus.onValue((x) -> values.push(x))
    expect(values).to.deep.equal(["x", "y"])

  it "throws if a non-observable is plugged", ->
    expect(-> new Bacon.Bus().plug(undefined)).to.throw()

  describe "delivers pushed events and errors", ->
    expectStreamEvents(
      ->
        s = new Bacon.Bus()
        s.push "pullMe"
        soon ->
          s.push "pushMe"
          s.error()
          s.end()
        s
      ["pushMe", error()])

  it "does not deliver pushed events after end() call", ->
    called = false
    bus = new Bacon.Bus()
    bus.onValue(-> called = true)
    bus.end()
    bus.push("LOL")
    expect(called).to.deep.equal(false)

  it "does not plug after end() call", ->
    plugged = false
    bus = new Bacon.Bus()
    bus.end()
    bus.plug(new Bacon.EventStream([], (sink) -> plugged = true; (->)))
    bus.onValue(->)
    expect(plugged).to.deep.equal(false)

  it "respects end() even events comes from plugged stream", ->
    failed = false
    busA = new Bacon.Bus()
    busB = new Bacon.Bus()
    busB.onValue(-> failed = true;)
    busB.plug(busA)
    busB.end()
    busA.push('foo')
    expect(failed).to.equal(false)

  it "does not plug after end(), second variant", ->
    failed = false
    busA = new Bacon.Bus()
    busB = new Bacon.Bus()
    busB.onValue(-> failed = true;)
    busB.plug(busA)
    busB.end()
    busA.push('foo')
    expect(failed).to.equal(false)
  
  it "respects end() calls before subscribers", ->
    failed = false
    bus = new Bacon.Bus()
    bus.end()
    bus.onValue(-> failed = true;)
    bus.push('foo')
    expect(failed).to.deep.equal(false)

  it "bounces End event to new subscribers after end() called, with subscribers", ->
    called = false
    bus = new Bacon.Bus()
    bus.onValue ->
    bus.end()
    bus.onEnd(-> called = true)
    expect(called).to.equal(true)

  it "bounces End event to new subscribers after end() called, without subscribers", ->
    called = false
    bus = new Bacon.Bus()
    bus.end()
    bus.onEnd(-> called = true)
    expect(called).to.equal(true)

  it "returns unplug function from plug", ->
    values = []
    bus = new Bacon.Bus()
    src = new Bacon.Bus()
    unplug = bus.plug(src)
    bus.onValue((x) -> values.push(x))
    src.push("x")
    unplug()
    src.push("y")
    expect(values).to.deep.equal(["x"])

  it "allows consumers to re-subscribe after other consumers have unsubscribed (bug fix)", ->
    bus = new Bacon.Bus
    otherBus = new Bacon.Bus
    otherBus.plug(bus)
    unsub = otherBus.onValue ->
    unsub()
    o = []
    otherBus.onValue (v) -> o.push(v)
    bus.push("foo")
    expect(o).to.deep.equal(["foo"])
  it "toString", ->
    expect(new Bacon.Bus().toString()).to.equal("Bacon.Bus()")
