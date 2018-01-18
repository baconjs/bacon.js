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

  describe "options", ->
    test = (options, eventTransformer = (x) -> x) ->
      # Basic EventTarget implementation for testing
      TestEventTarget = ->
        @eventEmitter = new EventEmitter
        @addListenerCalls = []
        @removeListenerCalls = []
        return

      TestEventTarget::addEventListener = (name, handler, options) ->
        @eventEmitter.addListener name, handler
        @addListenerCalls.push
          name: name
          handler: handler
          options: options
        return

      TestEventTarget::removeEventListener = (name, handler, options) ->
        @eventEmitter.removeListener name, handler
        @removeListenerCalls.push
          name: name
          handler: handler
          options: options
        return

      TestEventTarget::emit = (name, value) ->
        @eventEmitter.emit name, value
        return

      TestEventTarget::listeners = (name) ->
        @eventEmitter.listeners name

      EVENT_NAME = "test"
      values = []
      target = new TestEventTarget()
      stream = null

      if options? and eventTransformer?
        stream = Bacon.fromEvent(target, EVENT_NAME, options, eventTransformer)
      else if options?
        stream = Bacon.fromEvent(target, EVENT_NAME, options)
      else
        stream = Bacon.fromEvent(target, EVENT_NAME, eventTransformer)

      handler = (value) ->
        values.push(value)
        return

      # Test subscribe
      unsubscribe = stream.onValue(handler)
      expect(target.addListenerCalls.length).to.equal(1)
      expect(target.addListenerCalls[0].name).to.equal(EVENT_NAME)
      expect(target.addListenerCalls[0].handler).to.be.a.function
      expect(target.addListenerCalls[0].options).to.deep.equal(options)
      expect(target.listeners(EVENT_NAME).length).to.equal(1)
      expect(target.listeners(EVENT_NAME)[0]).to.be.a.function

      # Test events being propagated correctly
      target.emit EVENT_NAME, "Huzzah!"
      expect(values).to.deep.equal([eventTransformer("Huzzah!")])

      # Test unsubscribe
      unsubscribe()
      expect(target.removeListenerCalls.length).to.equal(1)
      expect(target.removeListenerCalls[0].name).to.equal(EVENT_NAME)
      expect(target.removeListenerCalls[0].handler).to.be.a.function
      expect(target.removeListenerCalls[0].options).to.deep.equal(options)
      expect(target.listeners(EVENT_NAME).length).to.equal(0)

    describe "options", ->
      it "should pass options to the target's subscribe and unsubscribe methods when no eventTransformer is provided", ->
        test({passive: true, capture: false})

      it "should pass options to the target's subscribe and unsubscribe methods when an eventTransformer is provided", ->
        test({passive: true, capture: false}, (x) => [x, x])

    describe "useCapture: true", ->
      it "should pass options to the target's subscribe and unsubscribe methods when no eventTransformer is provided", ->
        test(true)

      it "should pass options to the target's subscribe and unsubscribe methods when an eventTransformer is provided", ->
        test(true, (x) => [x, x])

    describe "useCapture: false", ->
      it "should pass options to the target's subscribe and unsubscribe methods when no eventTransformer is provided", ->
        test(false)

      it "should pass options to the target's subscribe and unsubscribe methods when an eventTransformer is provided", ->
        test(false, (x) => [x, x])

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

  onOffSource = -> {
    on: (type, callback) -> callback(type)
    off: (callback) -> this.cleaned = true
  }

  it "should create EventStream from on/off event", ->
    values = []
    src = onOffSource()
    take(1, Bacon.fromEvent(src, "test")).onValue (value) ->
      values.push(value)
    expect(values).to.deep.equal ["test"]
    expect(src.cleaned).to.equal(true)
  
  it "should create EventStream even if removeListener method missing", ->
    values = []
    src = {
      addListener: (type, callback) -> callback(type)
    }
    take(1, Bacon.fromEvent(src, "test")).onValue (value) ->
      values.push(value)
    expect(values).to.deep.equal ["test"]
  
  bindUnbindSource = -> {
    bind: (type, callback) -> callback(type)
    unbind: (callback) -> this.cleaned = true
    on: -> throw "bait method"
    addEventListener: -> throw "bait method"
    addListener: -> throw "bait method"
  }

  it "should create EventStream from bind/unbind event", ->
    values = []
    src = bindUnbindSource()
    take(1, Bacon.fromEvent(src, "test")).onValue (value) ->
      values.push(value)
    expect(values).to.deep.equal ["test"]
    expect(src.cleaned).to.equal(true)

  it "toString", ->
    expect(Bacon.fromEvent(onOffSource(), "click").toString()).to.equal("Bacon.fromEvent({on:function,off:function},click)")


