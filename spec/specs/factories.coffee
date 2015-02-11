describe "Bacon.fromBinder", ->
  describe "Provides an easier alternative to the EventStream constructor, allowing sending multiple events at a time", ->
    expectStreamEvents(
      ->
        Bacon.fromBinder (sink) ->
          sink([new Bacon.Next(1), new Bacon.End()])
          (->)
      [1])
  describe "Allows sending unwrapped values as well as events", ->
    expectStreamEvents(
      ->
        Bacon.fromBinder (sink) ->
          sink([1, new Bacon.End()])
          (->)
      [1])
  describe "Allows sending single value without wrapping array", ->
    expectStreamEvents(
      ->
        Bacon.fromBinder (sink) ->
          sink(1)
          sink(new Bacon.End())
          (->)
      [1])
  describe "unbind works in synchronous case", ->
    expectStreamEvents( ->
        Bacon.fromBinder (sink) ->
          unsubTest = Bacon.scheduler.setInterval((->), 10)
          sink("hello")
          sink(new Bacon.End())
          ->
            # test hangs if any interval is left uncleared
            Bacon.scheduler.clearInterval(unsubTest)
      ,
      ["hello"])

  it "calls unbinder only once", ->
    unbound = 0
    output = undefined
    timer = Bacon.fromBinder((sink) ->
        output = sink
        -> unbound++
    )
    timer.onValue(-> Bacon.noMore)
    output "hello"
    expect(unbound).to.equal(1)

  it "toString", ->
    expect(Bacon.fromBinder(->).toString()).to.equal("Bacon.fromBinder(function,function)")

describe "Bacon.once", ->
  describe "should send single event and end", ->
    expectStreamEvents(
      -> Bacon.once("pow")
      ["pow"])
  describe "accepts an Error event as parameter", ->
    expectStreamEvents(
      -> Bacon.once(new Bacon.Error("oop"))
      [error()])
  describe "Allows wrapped events, for instance, Bacon.Error", ->
    expectStreamEvents(
      -> Bacon.once(error())
      [error()])
  it "Responds synchronously", ->
    values = []
    s = Bacon.once(1)
    s.onValue(values.push.bind(values))
    expect(values).to.deep.equal([1])
    s.onValue(values.push.bind(values))
    expect(values).to.deep.equal([1])

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
  it "toString", ->
    expect(Bacon.fromArray([1,2]).toString()).to.equal("Bacon.fromArray([1,2])")
  it "doesn't mutate the given array, toString works after subscribe (bug fix)", ->
    array = [1,2]
    s = Bacon.fromArray(array)
    s.onValue(->)
    expect(s.toString()).to.equal("Bacon.fromArray([1,2])")
    expect(array).to.deep.equal([1,2])

describe "Bacon.never", ->
  describe "should send just end", ->
    expectStreamEvents(
      -> Bacon.never()
      [])
# Wrap EventEmitter as EventTarget
toEventTarget = (emitter) ->
  addEventListener: (event, handler) ->
    emitter.addListener(event, handler)
  removeEventListener: (event, handler) -> emitter.removeListener(event, handler)

describe "Bacon.fromEvent", ->
  it "is shorthand for Bacon.fromEventTarget", ->
    expect(Bacon.fromEvent).to.equal(Bacon.fromEventTarget)

describe "Bacon.fromEventTarget", ->
  soon = (f) -> setTimeout f, 0
  describe "should create EventStream from DOM object", ->
    expectStreamEvents(
      ->
        emitter = new EventEmitter()
        emitter.on "newListener", ->
          soon -> emitter.emit "click", "x"
        element = toEventTarget emitter
        take 1, Bacon.fromEventTarget(element, "click")
      ["x"]
    )

  describe "should create EventStream from EventEmitter", ->
    expectStreamEvents(
      ->
        emitter = new EventEmitter()
        emitter.on "newListener", ->
          soon -> emitter.emit "data", "x"
        take 1, Bacon.fromEventTarget(emitter, "data")
      ["x"]
    )

  describe "should allow a custom map function for EventStream from EventEmitter", ->
    expectStreamEvents(
      ->
        emitter = new EventEmitter()
        emitter.on "newListener", ->
          soon -> emitter.emit "data", "x", "y"
        take 1, Bacon.fromEventTarget(emitter, "data", (x, y) => [x, y])
      [["x", "y"]]
    )

  it "should clean up event listeners from EventEmitter", ->
    emitter = new EventEmitter()
    take(1, Bacon.fromEventTarget(emitter, "data")).subscribe ->
    emitter.emit "data", "x"
    expect(emitter.listeners("data").length).to.deep.equal(0)

  it "should clean up event listeners from DOM object", ->
    emitter = new EventEmitter()
    element = toEventTarget emitter
    dispose = Bacon.fromEventTarget(element, "click").subscribe ->
    dispose()
    expect(emitter.listeners("click").length).to.deep.equal(0)

  mockSource = {
    on: (type, callback) -> callback(type)
    off: (callback) -> 
  }

  it "should create EventStream from on/off event", ->
    values = []
    take(1, Bacon.fromEventTarget(mockSource, "test")).onValue (value) ->
      values.push(value)

  it "toString", ->
    expect(Bacon.fromEventTarget(mockSource, "click").toString()).to.equal("Bacon.fromEvent({on:function,off:function},click)")

