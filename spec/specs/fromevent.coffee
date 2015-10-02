# Wrap EventEmitter as EventTarget
toEventTarget = (emitter) ->
  addEventListener: (event, handler) ->
    emitter.addListener(event, handler)
  removeEventListener: (event, handler) -> emitter.removeListener(event, handler)

describe "Bacon.fromEventTarget", ->
  it "is legacy name for Bacon.fromEvent", ->
    expect(Bacon.fromEvent).to.equal(Bacon.fromEventTarget)

describe "Bacon.fromEvent", ->
  soon = (f) -> setTimeout f, 0
  describe "should create EventStream from DOM object", ->
    expectStreamEvents(
      ->
        emitter = new EventEmitter()
        emitter.on "newListener", ->
          soon -> emitter.emit "click", "x"
        element = toEventTarget emitter
        take 1, Bacon.fromEvent(element, "click")
      ["x"]
    )

  describe "should create EventStream from EventEmitter", ->
    expectStreamEvents(
      ->
        emitter = new EventEmitter()
        emitter.on "newListener", ->
          soon -> emitter.emit "data", "x"
        take 1, Bacon.fromEvent(emitter, "data")
      ["x"]
    )

  describe "should allow a custom map function for EventStream from EventEmitter", ->
    expectStreamEvents(
      ->
        emitter = new EventEmitter()
        emitter.on "newListener", ->
          soon -> emitter.emit "data", "x", "y"
        take 1, Bacon.fromEvent(emitter, "data", (x, y) => [x, y])
      [["x", "y"]]
    )

  it "should clean up event listeners from EventEmitter", ->
    emitter = new EventEmitter()
    take(1, Bacon.fromEvent(emitter, "data")).subscribe ->
    emitter.emit "data", "x"
    expect(emitter.listeners("data").length).to.deep.equal(0)

  it "should clean up event listeners from DOM object", ->
    emitter = new EventEmitter()
    element = toEventTarget emitter
    dispose = Bacon.fromEvent(element, "click").subscribe ->
    dispose()
    expect(emitter.listeners("click").length).to.deep.equal(0)

  mockSource = {
    on: (type, callback) -> callback(type)
    off: (callback) -> 
  }

  it "should create EventStream from on/off event", ->
    values = []
    take(1, Bacon.fromEvent(mockSource, "test")).onValue (value) ->
      values.push(value)

  it "toString", ->
    expect(Bacon.fromEvent(mockSource, "click").toString()).to.equal("Bacon.fromEvent({on:function,off:function},click)")


