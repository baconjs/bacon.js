Bacon = (require "../src/Bacon").Bacon
Mocks = (require "./Mock")
mock = Mocks.mock
mockFunction = Mocks.mockFunction
EventEmitter = require("events").EventEmitter
th = require("./SpecHelper")
t = th.t
expectStreamEvents = th.expectStreamEvents
expectPropertyEvents = th.expectPropertyEvents
verifyCleanup = th.verifyCleanup
error = th.error
soon = th.soon
series = th.series
repeat = th.repeat

describe "Bacon.later", ->
  it "should send single event and end", ->
    expectStreamEvents(
      -> Bacon.later(t(1), "lol")
      ["lol"])

describe "Bacon.sequentially", ->
  it "should send given events and end", ->
    expectStreamEvents(
      -> Bacon.sequentially(t(1), ["lol", "wut"])
      ["lol", "wut"])
  it "include error events", ->
    expectStreamEvents(
      -> Bacon.sequentially(t(1), [error(), "lol"])
      [error(), "lol"])

describe "Bacon.interval", ->
  it "repeats single element indefinitely", ->
    expectStreamEvents(
      -> Bacon.interval(t(1), "x").take(3)
      ["x", "x", "x"])

describe "Bacon.fromCallback", ->
  it "makes an EventStream from function that takes a callback", ->
    expectStreamEvents( 
      ->
        src = (callback) -> callback("lol")
        stream = Bacon.fromCallback(src)
      ["lol"])
  it "supports partial application", ->
    expectStreamEvents(
      ->
        src = (param, callback) -> callback(param)
        stream = Bacon.fromCallback(src, "lol")
      ["lol"])

describe "Bacon.fromEventTarget", ->
  it "should create EventStream from DOM object", ->
    emitter = new EventEmitter()
    emitter.on "newListener", ->
      runs ->
        emitter.emit "click", "x"

    element = toEventTarget emitter

    expectStreamEvents(
      -> Bacon.fromEventTarget(element, "click").take(1)
      ["x"]
    )

  it "should create EventStream from EventEmitter", ->
    emitter = new EventEmitter()
    emitter.on "newListener", ->
      runs ->
        emitter.emit "data", "x"

    expectStreamEvents(
      -> Bacon.fromEventTarget(emitter, "data").take(1)
      ["x"]
    )

  it "should clean up event listeners from EventEmitter", ->
    emitter = new EventEmitter()
    Bacon.fromEventTarget(emitter, "data").take(1).subscribe ->
    emitter.emit "data", "x"
    expect(emitter.listeners("data").length).toEqual(0)

  it "should clean up event listeners from DOM object", ->
    emitter = new EventEmitter()
    element = toEventTarget emitter
    dispose = Bacon.fromEventTarget(element, "click").subscribe ->
    dispose()
    expect(emitter.listeners("click").length).toEqual(0)

describe "Observable.log", ->
  it "does not crash", ->
    Bacon.constant(1).log
    
describe "Observable.slidingWindow", ->
  it "slides the window for EventStreams", ->
    expectPropertyEvents(
      -> series(1, [1,2,3]).slidingWindow(2)
      [[], [1], [1,2], [2,3]])
  it "slides the window for Properties", ->
    expectPropertyEvents(
      -> series(1, [1,2,3]).toProperty().slidingWindow(2)
      [[], [1], [1,2], [2,3]])

describe "EventStream.filter", -> 
  it "should filter values", ->
    expectStreamEvents(
      -> series(1, [1, 2, error(), 3]).filter(lessThan(3))
      [1, 2, error()])
  it "extracts field values", ->
    expectStreamEvents(
      -> series(1, [{good:true, value:"yes"}, {good:false, value:"no"}]).filter(".good").map(".value")
      ["yes"])
  it "can filter by Property value", ->
    expectStreamEvents(
      -> 
        src = series(1, [1,1,2,3,4,4,8,7])
        odd = src.map((x) -> x % 2).toProperty()
        src.filter(odd)
      [1,1,3,7])

describe "EventStream.map", ->
  it "should map with given function", ->
    expectStreamEvents(
      -> series(1, [1, 2, 3]).map(times, 2)
      [2, 4, 6])
  it "also accepts a constant value", ->
    expectStreamEvents(
      -> series(1, [1, 2, 3,]).map("lol")
      ["lol", "lol", "lol"])
  it "extracts property from value object", ->
    o = { lol : "wut" }
    expectStreamEvents(
      -> repeat(1, [o]).take(3).map(".lol")
      ["wut", "wut", "wut"])
  it "extracts a nested property too", ->
    o = { lol : { wut : "wat" } }
    expectStreamEvents(
      -> Bacon.once(o).map(".lol.wut")
      ["wat"])
  it "in case of a function property, calls the function with no args", ->
    expectStreamEvents(
      -> Bacon.once([1,2,3]).map(".length")
      [3])
  it "allows arguments for methods", ->
    thing = { square: (x) -> x * x }
    expectStreamEvents(
      -> Bacon.once(thing).map(".square", 2)
      [4])
  it "works with method call on given object, with partial application", ->
    multiplier = { multiply: (x, y) -> x * y }
    expectStreamEvents(
      -> series(1, [1,2,3]).map(multiplier, "multiply", 2)
      [2,4,6])
  it "can map to a Property value", ->
    expectStreamEvents(
      -> series(1, [1,2,3]).map(Bacon.constant(2))
      [2,2,2])

describe "EventStream.mapError", ->
  it "should map error events with given function", ->
    expectStreamEvents(
        -> repeat(1, [1, error("OOPS")]).mapError(id).take(2)
        [1, "OOPS"])
  it "also accepts a constant value", ->
    expectStreamEvents(
        -> repeat(1, [1, error()]).mapError("ERR").take(2)
        [1, "ERR"])

describe "EventStream.doAction", ->
  it "calls function before sending value to listeners", ->
    called = []
    bus = new Bacon.Bus()
    s = bus.doAction((x) -> called.push(x))
    s.onValue(->)
    s.onValue(->)
    bus.push(1)
    expect(called).toEqual([1])
  it "does not alter the stream", ->
    expectStreamEvents(
      -> series(1, [1, 2]).doAction(->)
      [1, 2])
  it "is dubbed by do for backward compatibility", ->
    expectStreamEvents(
      -> Bacon.once(1).do(->)
      [1])

describe "EventStream.mapEnd", ->
  it "produces an extra element on stream end", ->
    expectStreamEvents(
      -> series(1, ["1", error()]).mapEnd("the end")
      ["1", error(), "the end"])
  it "accepts either a function or a constant value", ->
    expectStreamEvents(
      -> series(1, ["1", error()]).mapEnd(-> "the end")
      ["1", error(), "the end"])
  it "works with undefined value as well", ->
    expectStreamEvents(
      -> series(1, ["1", error()]).mapEnd()
      ["1", error(), undefined])

describe "EventStream.takeWhile", ->
  it "should take while predicate is true", ->
    expectStreamEvents(
      -> repeat(1, [1, error("wat"), 2, 3]).takeWhile(lessThan(3))
      [1, error("wat"), 2])

describe "EventStream.skip", ->
  it "should skip first N items", ->
    expectStreamEvents(
      -> series(1, [1, error(), 2, error(), 3]).skip(1)
    [error(), 2, error(), 3])

describe "EventStream.skipDuplicates", ->
  it "drops duplicates", ->
    expectStreamEvents(
      -> series(1, [1, 2, error(), 2, 3, 1]).skipDuplicates()
    [1, 2, error(), 3, 1])
  it "works with custom isEqual function", ->
    a = {x: 1}; b = {x: 2}; c = {x: 2}; d = {x: 3}; e = {x: 1}
    isEqual = (a, b) -> a?.x == b?.x
    expectStreamEvents(
      -> series(1, [a, b, error(), c, d, e]).skipDuplicates(isEqual)
      [a, b, error(), d, e])

describe "EventStream.flatMap", ->
  it "should spawn new stream for each value and collect results into a single stream", ->
    expectStreamEvents(
      -> series(1, [1, 2]).flatMap (value) ->
        Bacon.sequentially(t(2), [value, error(), value])
      [1, 2, error(), error(), 1, 2])
  it "should pass source errors through to the result", ->
    expectStreamEvents(
      -> series(1, [error(), 1]).flatMap (value) ->
        Bacon.later(t(1), value)
      [error(), 1])
  it "should work with a spawned stream responding synchronously", ->
    expectStreamEvents(
      -> series(1, [1, 2]).flatMap (value) ->
         Bacon.never().concat(Bacon.once(value))
      [1, 2])
  it "should work with a source stream responding synchronously", ->
    expectStreamEvents(
      -> Bacon.once(1).flatMap (value) ->
         Bacon.once(value)
      [1])

describe "Property.flatMap", ->
  it "should spawn new stream for all events including Init", ->
    expectStreamEvents(
      -> 
        once = (x) -> Bacon.once(x)
        series(1, [1, 2]).toProperty(0).flatMap(once)
      [0, 1, 2])


describe "EventStream.flatMapLatest", ->
  it "spawns new streams but collects values from the latest spawned stream only", ->
    expectStreamEvents(
      -> series(3, [1, 2]).flatMapLatest (value) ->
        Bacon.sequentially(t(2), [value, error(), value])
      [1, 2, error(), 2])
  it "is dubbed by switch for backward compatibility", ->
    expectStreamEvents(
      -> Bacon.once(1).switch((value) -> Bacon.once(value))
      [1])

describe "Property.switch", ->
  it "spawns new streams but collects values from the latest spawned stream only", ->
    expectStreamEvents(
      -> series(3, [1, 2]).toProperty(0).switch (value) ->
        Bacon.sequentially(t(2), [value, value])
      [0, 1, 2, 2])

describe "EventStream.merge", ->
  it "merges two streams and ends when both are exhausted", ->
    expectStreamEvents( 
      ->
        left = series(1, [1, error(), 2, 3])
        right = series(1, [4, 5, 6]).delay(t(4))
        left.merge(right)
      [1, error(), 2, 3, 4, 5, 6])
  it "respects subscriber return value", ->
    expectStreamEvents(
      ->
        left = repeat(2, [1, 3]).take(3)
        right = repeat(3, [2]).take(3)
        left.merge(right).takeWhile(lessThan(2))
      [1])

describe "EventStream.delay", ->
  it "delays all events (except errors) by given delay in milliseconds", ->
    expectStreamEvents(
      ->
        left = series(2, [1, 2, 3])
        right = series(1, [error(), 4, 5, 6]).delay(t(6))
        left.merge(right)
      [error(), 1, 2, 3, 4, 5, 6])

describe "EventStream.throttle", ->
  it "throttles input by given delay, passing-through errors", ->
    expectStreamEvents(
      -> series(2, [1, error(), 2]).throttle(t(7))
      [error(), 2])

describe "EventStream.bufferWithTime", ->
  it "returns events in bursts, passing through errors", ->
    expectStreamEvents(
      -> series(2, [error(), 1, 2, 3, 4, 5, 6, 7]).bufferWithTime(t(7))
      [error(), [1, 2, 3, 4], [5, 6, 7]])

describe "EventStream.bufferWithCount", ->
  it "returns events in chunks of fixed size, passing through errors", ->
    expectStreamEvents(
      -> series(1, [1, 2, 3, error(), 4, 5]).bufferWithCount(2)
      [[1, 2], error(), [3, 4], [5]])

describe "EventStream.takeUntil", ->
  it "takes elements from source until an event appears in the other stream", ->
    expectStreamEvents(
      ->
        src = repeat(3, [1, 2, 3])
        stopper = repeat(7, ["stop!"])
        src.takeUntil(stopper)
      [1, 2])
  it "works on self-derived stopper", ->
    expectStreamEvents(
      ->
        src = repeat(3, [3, 2, 1])
        stopper = src.filter(lessThan(3))
        src.takeUntil(stopper)
      [3])
  it "includes source errors, ignores stopper errors", ->
    expectStreamEvents(
      ->
        src = repeat(2, [1, error(), 2, 3])
        stopper = repeat(7, ["stop!"]).merge(repeat(1, [error()]))
        src.takeUntil(stopper)
      [1, error(), 2])

describe "EventStream.endOnError", ->
  it "terminates on error", ->
    expectStreamEvents(
      -> repeat(1, [1, 2, error(), 3]).endOnError()
      [1, 2, error()])

describe "Bacon.constant", ->
  it "creates a constant property", ->
    expectPropertyEvents(
      -> Bacon.constant("lol")
    ["lol"])
  it "ignores unsubscribe", ->
    Bacon.constant("lol").onValue(=>)()
  it "provides same value to all listeners", ->
    c = Bacon.constant("lol")
    expectPropertyEvents((-> c), ["lol"])
    f = mockFunction()
    c.onValue(f)
    f.verify("lol")
  it "provides same value to all listeners, when mapped (bug fix)", ->
    c = Bacon.constant("lol").map(id)
    f = mockFunction()
    c.onValue(f)
    f.verify("lol")
    c.onValue(f)
    f.verify("lol")

describe "Bacon.never", ->
  it "should send just end", ->
    expectStreamEvents(
      -> Bacon.never()
      [])

describe "Bacon.once", ->
  it "should send single event and end", ->
    expectStreamEvents(
      -> Bacon.once("pow")
      ["pow"])

describe "EventStream.concat", ->
  it "provides values from streams in given order and ends when both are exhausted", ->
    expectStreamEvents(
      ->
        left = series(2, [1, error(), 2, 3])
        right = series(1, [4, 5, 6])
        left.concat(right)
      [1, error(), 2, 3, 4, 5, 6])
  it "respects subscriber return value when providing events from left stream", ->
    expectStreamEvents(
      ->
        left = repeat(3, [1, 3]).take(3)
        right = repeat(2, [1]).take(3)
        left.concat(right).takeWhile(lessThan(2))
      [1])
  it "respects subscriber return value when providing events from right stream", ->
    expectStreamEvents(
      ->
        left = series(3, [1, 2])
        right = series(2, [2, 4, 6])
        left.concat(right).takeWhile(lessThan(4))
      [1, 2, 2])
  it "works with Bacon.never()", ->
    expectStreamEvents(
      -> Bacon.never().concat(Bacon.never())
      [])
  it "works with Bacon.once()", ->
    expectStreamEvents(
      -> Bacon.once(2).concat(Bacon.once(1))
      [2, 1])
  it "works with Bacon.once() and Bacon.never()", ->
    expectStreamEvents(
      -> Bacon.once(1).concat(Bacon.never())
      [1])
  it "works with Bacon.never() and Bacon.once()", ->
    expectStreamEvents(
      -> Bacon.never().concat(Bacon.once(1))
      [1])

describe "EventStream.startWith", ->
  it "provides seed value, then the rest", ->
    expectStreamEvents(
      ->
        left = series(1, [1, 2, 3])
        left.startWith('pow')
      ['pow', 1, 2, 3])

describe "EventStream.decorateWithProperty", ->
  it "decorates stream event with Property value", ->
    expectStreamEvents(
      ->
        series(1, [{i:0}, error(), {i:1}]).decorateWith("label", Bacon.constant("lol"))
      [{i:0, label:"lol"}, error(), {i:1, label:"lol"}])

describe "Property", ->
  it "delivers current value and changes to subscribers", ->
    expectPropertyEvents(
      ->
        s = new Bacon.Bus()
        p = s.toProperty("a")
        soon ->
          s.push "b"
          s.end()
        p
      ["a", "b"])
  
  it "passes through also Errors", ->
    expectPropertyEvents(
      -> series(1, [1, error(), 2]).toProperty()
      [1, error(), 2])

  it "supports null as value", ->
    expectPropertyEvents(
      -> series(1, [null, 1, null]).toProperty(null)
      [null, null, 1, null])

  it "does not get messed-up by a transient subscriber (bug fix)", ->
    expectPropertyEvents(
      ->
        prop = series(1, [1,2,3]).toProperty(0)
        prop.subscribe (event) =>
          Bacon.noMore
        prop
      [0, 1, 2, 3])

describe "Property.toEventStream", ->
  it "creates a stream that starts with current property value", ->
    expectStreamEvents(
      -> series(1, [1, 2]).toProperty(0).toEventStream()
      [0, 1, 2])

describe "Property.map", ->
  it "maps property values", ->
    expectPropertyEvents(
      ->
        s = new Bacon.Bus()
        p = s.toProperty(1).map(times, 2)
        soon ->
          s.push 2
          s.error()
          s.end()
        p
      [2, 4, error()])

describe "Property.filter", -> 
  it "should filter values", ->
    expectPropertyEvents(
      -> series(1, [1, error(), 2, 3]).toProperty().filter(lessThan(3))
      [1, error(), 2])
  it "preserves old current value if the updated value is non-matching", ->
    s = new Bacon.Bus()
    p = s.toProperty().filter(lessThan(2))
    p.onValue(=>) # to ensure that property is actualy updated
    s.push(1)
    s.push(2)
    values = []
    p.onValue((v) => values.push(v))
    expect(values).toEqual([1])

describe "Property.take(1)", ->
  it "takes the Initial event", ->
    expectPropertyEvents(
      -> series(1, [1,2,3]).toProperty(0).take(1)
      [0])
  it "takes the first Next event, if no Initial value", ->
    expectPropertyEvents(
      -> series(1, [1,2,3]).toProperty().take(1)
      [1])
  it "works for constants", ->
    expectPropertyEvents(
      -> Bacon.constant(1)
      [1])

describe "Bacon.once().take(1)", ->
  it "works", ->
    expectStreamEvents(
      -> Bacon.once(1).take(1)
      [1])

describe "Property.takeUntil", ->
  it "takes elements from source until an event appears in the other stream", ->
    expectPropertyEvents(
      -> series(2, [1,2,3]).toProperty().takeUntil(Bacon.later(t(3)))
      [1])
  it "works with errors", ->
    expectPropertyEvents(
      ->
        src = repeat(2, [1, error(), 3])
        stopper = repeat(5, ["stop!"])
        src.toProperty(0).takeUntil(stopper)
      [0, 1, error()])

describe "Property.delay", ->
  it "delivers initial value and changes", ->
    expectPropertyEvents(
      -> series(1, [1,2,3]).toProperty(0).delay(t(1))
      [0,1,2,3])
  it "delays changes", ->
    expectStreamEvents(
      -> series(2, [1,2,3]).toProperty()
        .delay(t(2)).changes().takeUntil(Bacon.later(t(5)))
      [1])
  it "does not delay initial value", ->
    expectPropertyEvents(
      -> series(3, [1]).toProperty(0).delay(1).takeUntil(Bacon.later(t(2)))
      [0])

describe "Property.throttle", ->
  it "delivers initial value and changes", ->
    expectPropertyEvents(
      -> series(2, [1,2,3]).toProperty(0).throttle(t(1))
      [0,1,2,3])
  it "throttles changes, but not initial value", ->
    expectPropertyEvents(
      -> series(1, [1,2,3]).toProperty(0).throttle(t(4))
      [0,3])
  it "works without initial value", ->
    expectPropertyEvents(
      -> series(2, [1,2,3]).toProperty().throttle(t(4))
      [3])

describe "Property.endOnError", ->
  it "terminates on Error", ->
    expectPropertyEvents(
      -> series(2, [1, error(), 2]).toProperty().endOnError()
      [1, error()])

describe "Property.distinctUntilChanged", ->
  it "drops duplicates", ->
    expectPropertyEvents(
      -> series(1, [1, 2, error(), 2, 3, 1]).toProperty(0).distinctUntilChanged()
    [0, 1, 2, error(), 3, 1])

describe "Property.changes", ->
  it "sends property change events", ->
    expectStreamEvents(
      ->
        s = new Bacon.Bus()
        p = s.toProperty("a").changes()
        soon ->
          s.push "b"
          s.error()
          s.end()
        p
      ["b", error()])

describe "Property.combine", ->
  it "combines latest values of two properties, with given combinator function, passing through errors", ->
    expectPropertyEvents( 
      ->
        left = series(2, [1, error(), 2, 3]).toProperty()
        right = series(2, [4, error(), 5, 6]).delay(t(1)).toProperty()
        left.combine(right, add)
      [5, error(), error(), 6, 7, 8, 9])
  it "also accepts a field name instead of combinator function", ->
    expectPropertyEvents(
      ->
        left = series(1, [[1]]).toProperty()
        right = series(2, [[2]]).toProperty()
        left.combine(right, ".concat")
      [[1, 2]])

  it "combines with null values", ->
    expectPropertyEvents(
      ->
        left = series(1, [null]).toProperty()
        right = series(1, [null]).toProperty()
        left.combine(right, (l, r)-> [l, r])
      [[null, null]])

  it "unsubscribes when initial value callback returns Bacon.noMore", ->
    calls = 0
    bus = new Bacon.Bus()
    other = Bacon.constant(["rolfcopter"])
    bus.toProperty(["lollerskates"]).combine(other, ".concat").subscribe (e) ->
      if !e.isInitial()
        calls += 1
      Bacon.noMore

    bus.push(["fail whale"])
    expect(calls).toBe 0

describe "Bacon.combineAsArray", -> 
  it "combines properties and latest values of streams, into a Property having arrays as values", ->
    expectPropertyEvents(
      ->
        stream = series(1, ["a", "b"])
        Bacon.combineAsArray([Bacon.constant(1), Bacon.constant(2), stream])
      [[1, 2, "a"], [1, 2, "b"]])
  it "Works with streams provided as a list of arguments as well as with a single array arg", ->
    expectPropertyEvents(
      ->
        stream = series(1, ["a", "b"])
        Bacon.combineAsArray(Bacon.constant(1), Bacon.constant(2), stream)
      [[1, 2, "a"], [1, 2, "b"]])
  it "works with single stream", ->
    expectPropertyEvents(
      ->
        Bacon.combineAsArray([Bacon.constant(1)])
      [[1]])
  it "works with arrays as values, with first array being empty (bug fix)", ->
    expectPropertyEvents(
      ->
        Bacon.combineAsArray([Bacon.constant([]), Bacon.constant([1])])
    ([[[], [1]]]))
  it "works with arrays as values, with first array being non-empty (bug fix)", ->
    expectPropertyEvents(
      ->
        Bacon.combineAsArray([Bacon.constant([1]), Bacon.constant([2])])
    ([[[1], [2]]]))
  it "works with empty array", ->
    expectPropertyEvents(
      -> Bacon.combineAsArray([])
      [[]])

describe "Bacon.combineWith", ->
  it "combines properties by applying the combinator function to values", ->
    expectPropertyEvents(
      ->
        stream = series(1, [[1]])
        Bacon.combineWith([stream, Bacon.constant([2]), Bacon.constant([3])], ".concat")
      [[1, 2, 3]])

describe "Boolean logic", ->
  it "combines Properties with and()", ->
    expectPropertyEvents(
      -> Bacon.constant(true).and(Bacon.constant(false))
      [false])
  it "combines Properties with or()", ->
    expectPropertyEvents(
      -> Bacon.constant(true).or(Bacon.constant(false))
      [true])
  it "inverts property with not()", ->
    expectPropertyEvents(
      -> Bacon.constant(true).not()
      [false])

describe "Bacon.mergeAll", ->
  it ("merges all given streams"), ->
    expectStreamEvents(
      ->
        Bacon.mergeAll([
          series(3, [1, 2])
          series(3, [3, 4]).delay(t(1))
          series(3, [5, 6]).delay(t(2))])
      [1, 3, 5, 2, 4, 6])

describe "Property.sampledBy", -> 
  it "samples property at events, resulting to EventStream", ->
    expectStreamEvents(
      ->
        prop = series(2, [1, 2]).toProperty()
        stream = repeat(3, ["troll"]).take(4)
        prop.sampledBy(stream)
      [1, 2, 2, 2])
  it "includes errors from both Property and EventStream", ->
    expectStreamEvents(
      ->
        prop = series(2, [error(), 2]).toProperty()
        stream = series(3, [error(), "troll"])
        prop.sampledBy(stream)
      [error(), error(), 2])
  it "ends when sampling stream ends", ->
    expectStreamEvents(
      ->
        prop = repeat(2, [1, 2]).toProperty()
        stream = repeat(2, [""]).delay(t(1)).take(4)
        prop.sampledBy(stream)
      [1, 2, 1, 2])
  it "accepts optional combinator function f(Vp, Vs)", ->
    expectStreamEvents(
      ->
        prop = series(2, ["a", "b"]).toProperty()
        stream = series(2, ["1", "2", "1", "2"]).delay(t(1))
        prop.sampledBy(stream, add)
      ["a1", "b2", "b1", "b2"])
  it "allows method name instead of function too", ->
    expectStreamEvents(
      ->
        Bacon.constant([1]).sampledBy(Bacon.once([2]), ".concat")
      [[1, 2]])
  it "works with same origin", ->
    expectStreamEvents(
      ->
        src = series(2, [1, 2])
        src.toProperty().sampledBy(src)
      [1, 2])
    expectStreamEvents(
      ->
        src = series(2, [1, 2])
        src.toProperty().sampledBy(src.map(times, 2))
      [1, 2])

describe "Property.sample", -> 
  it "samples property by given interval", ->
    expectStreamEvents(
      ->
        prop = series(2, [1, 2]).toProperty()
        prop.sample(t(3)).take(4)
      [1, 2, 2, 2])
  it "includes all errors", ->
    expectStreamEvents(
      ->
        prop = series(2, [1, error(), 2]).toProperty()
        prop.sample(t(5)).take(2)
      [error(), 1, 2])

describe "Bacon.latestValue(property)()", ->
  it "returns current value of property", ->
    expect(Bacon.latestValue(Bacon.constant(1))()).toEqual(1)

describe "EventStream.scan", ->
  it "accumulates values with given seed and accumulator function, passing through errors", ->
    expectPropertyEvents(
      -> series(1, [1, 2, error(), 3]).scan(0, add)
      [0, 1, 3, error(), 6])
  it "also works with method name", ->
    expectPropertyEvents(
      -> series(1, [[1], [2]]).scan([], ".concat")
      [[], [1], [1, 2]])
  it "yields the seed value immediately", ->
    outputs = []
    bus = new Bacon.Bus()
    bus.scan(0, -> 1).onValue((value) -> outputs.push(value))
    expect(outputs).toEqual([0])
  it "yields null seed value", ->
    expectPropertyEvents(
      -> series(1, [1]).scan(null, ->1)
      [null, 1])

describe "Property.scan", ->
  it "with Init value, starts with f(seed, init)", ->
    expectPropertyEvents(
      -> series(1, [2,3]).toProperty(1).scan(0, add)
      [1, 3, 6])
  it "without Init value, starts with seed", ->
    expectPropertyEvents(
      -> series(1, [2,3]).toProperty().scan(0, add)
      [0, 2, 5])
  it "treats null seed value like any other value", ->
    expectPropertyEvents(
      -> series(1, [1]).toProperty().scan(null, add)
      [null, 1])
    expectPropertyEvents(
      -> series(1, [2]).toProperty(1).scan(null, add)
      [1, 3])

describe "combineTemplate", ->
  it "combines streams according to a template object", ->
    expectPropertyEvents(
      -> 
         firstName = Bacon.constant("juha")
         lastName = Bacon.constant("paananen")
         userName = Bacon.constant("mr.bacon")
         Bacon.combineTemplate({ userName: userName, password: "*****", fullName: { firstName: firstName, lastName: lastName }})
      [{ userName: "mr.bacon", password: "*****", fullName: { firstName: "juha", lastName: "paananen" } }])
  it "works with a single-stream template", ->
    expectPropertyEvents(
      ->
        bacon = Bacon.constant("bacon")
        Bacon.combineTemplate({ favoriteFood: bacon })
      [{ favoriteFood: "bacon" }])
  it "works when dynamic part is not the last part (bug fix)", ->
    expectPropertyEvents(
      ->
        username = Bacon.constant("raimohanska")
        password = Bacon.constant("easy")
        Bacon.combineTemplate({url: "/user/login",
        data: { username: username, password: password }, type: "post"})
      [url: "/user/login", data: {username: "raimohanska", password: "easy"}, type: "post"])
  it "works with arrays as data (bug fix)", ->
    expectPropertyEvents(
      -> Bacon.combineTemplate( { x : Bacon.constant([]), y : Bacon.constant([[]]), z : Bacon.constant(["z"])})
      [{ x : [], y : [[]], z : ["z"]}])
  it "supports empty object", ->
    expectPropertyEvents(
      -> Bacon.combineTemplate({})
      [{}])
  it "supports arrays", ->
    value = {key: [{ x: 1 }, { x: 2 }]}
    Bacon.combineTemplate(value).onValue (x) ->
      expect(x).toEqual(value)
      expect(x.key instanceof Array).toEqual(true) # seems that the former passes even if x is not an array
    value = [{ x: 1 }, { x: 2 }]
    Bacon.combineTemplate(value).onValue (x) ->
      expect(x).toEqual(value)
      expect(x instanceof Array).toEqual(true)
    value = {key: [{ x: 1 }, { x: 2 }], key2: {}}
    Bacon.combineTemplate(value).onValue (x) ->
      expect(x).toEqual(value)
      expect(x.key instanceof Array).toEqual(true)
    value = {key: [{ x: 1 }, { x: Bacon.constant(2) }]}
    Bacon.combineTemplate(value).onValue (x) ->
      expect(x).toEqual({key: [{ x: 1 }, { x: 2 }]})
      expect(x.key instanceof Array).toEqual(true) # seems that the former passes even if x is not an array

describe "Property.decode", ->
  it "switches between source Properties based on property value", ->
    expectPropertyEvents(
      ->
        a = Bacon.constant("a")
        b = Bacon.constant("b")
        c = Bacon.constant("c")
        series(1, [1,2,3]).toProperty().decode({1: a, 2: b, 3: c})
      ["a", "b", "c"])

describe "Observable.onValues", ->
  it "splits value array to callback arguments", ->
    f = mockFunction()
    Bacon.constant([1,2,3]).onValues(f)
    f.verify(1,2,3)

describe "Observable.subscribe and onValue", ->
  it "returns a dispose() for unsubscribing", ->
    s = new Bacon.Bus()
    values = []
    dispose = s.onValue (value) -> values.push value
    s.push "lol"
    dispose()
    s.push "wut"
    expect(values).toEqual(["lol"])

describe "Observable.onEnd", ->
  it "is called on stream end", ->
    s = new Bacon.Bus()
    ended = false
    s.onEnd(-> ended = true)
    s.push("LOL")
    expect(ended).toEqual(false)
    s.end()
    expect(ended).toEqual(true)

describe "Field value extraction", ->
  it "extracts field value", ->
    expectStreamEvents(
      -> Bacon.once({lol:"wut"}).map(".lol")
      ["wut"])
  it "extracts nested field value", ->
    expectStreamEvents(
      -> Bacon.once({lol:{wut: "wat"}}).map(".lol.wut")
      ["wat"])
  it "if field value is method, it does a method call", ->
    context = null
    result = null
    object = {
      method: -> 
        context = this
        "result"
    }
    Bacon.once(object).map(".method").onValue((x) -> result = x)
    expect(result).toEqual("result")
    expect(context).toEqual(object)

testSideEffects = (wrapper, method) ->
  ->
    it "(f) calls function with property value", ->
      f = mockFunction()
      wrapper("kaboom")[method](f)
      f.verify("kaboom")
    it "(f, param) calls function, partially applied with param", ->
      f = mockFunction()
      wrapper("kaboom")[method](f, "pow")
      f.verify("pow", "kaboom")
    it "('.method') calls event value object method", ->
      value = mock("get")
      value.when().get().thenReturn("pow")
      wrapper(value)[method](".get")
      value.verify().get()
    it "('.method', param) calls event value object method with param", ->
      value = mock("get")
      value.when().get("value").thenReturn("pow")
      wrapper(value)[method](".get", "value")
      value.verify().get("value")
    it "(object, method) calls object method with property value", ->
      target = mock("pow")
      wrapper("kaboom")[method](target, "pow")
      target.verify().pow("kaboom")
    it "(object, method, param) partially applies object method with param", ->
      target = mock("pow")
      wrapper("kaboom")[method](target, "pow", "smack")
      target.verify().pow("smack", "kaboom")
    it "(object, method, param1, param2) partially applies with 2 args", ->
      target = mock("pow")
      wrapper("kaboom")[method](target, "pow", "smack", "whack")
      target.verify().pow("smack", "whack", "kaboom")

describe "Property.onValue", testSideEffects(Bacon.constant, "onValue")
describe "Property.assign", testSideEffects(Bacon.constant, "assign")
describe "EventStream.onValue", testSideEffects(Bacon.once, "onValue")

describe "Property.assign", ->
  it "calls given objects given method with property values", ->
    target = mock("pow")
    Bacon.constant("kaboom").assign(target, "pow")
    target.verify().pow("kaboom")
  it "allows partial application of method (i.e. adding fixed args)", ->
    target = mock("pow")
    Bacon.constant("kaboom").assign(target, "pow", "smack")
    target.verify().pow("smack", "kaboom")
  it "allows partial application of method with 2 args (i.e. adding fixed args)", ->
    target = mock("pow")
    Bacon.constant("kaboom").assign(target, "pow", "smack", "whack")
    target.verify().pow("smack", "whack", "kaboom")

describe "Bacon.Bus", ->
  it "merges plugged-in streams", ->
    bus = new Bacon.Bus()
    values = []
    dispose = bus.onValue (value) -> values.push value
    push = new Bacon.Bus()
    bus.plug(push)
    push.push("lol")
    expect(values).toEqual(["lol"])
    dispose()
    verifyCleanup()
  it "works with looped streams", ->
    expectStreamEvents(
      ->
        bus = new Bacon.Bus()
        bus.plug(Bacon.later(t(2), "lol"))
        bus.plug(bus.filter((value) => "lol" == value).map(=> "wut"))
        Bacon.later(t(4)).onValue(=> bus.end())
        bus
      ["lol", "wut"])
  it "dispose works with looped streams", ->
    bus = new Bacon.Bus()
    bus.plug(Bacon.later(t(2), "lol"))
    bus.plug(bus.filter((value) => "lol" == value).map(=> "wut"))
    dispose = bus.onValue(=>)
    dispose()
  it "Removes input from input list on End event", ->
    subscribed = 0
    bus = new Bacon.Bus()
    input = new Bacon.Bus()
    # override subscribe to increase the subscribed-count
    inputSubscribe = input.subscribe
    input.subscribe = (sink) ->
      subscribed++
      inputSubscribe(sink)
    bus.plug(input)
    dispose = bus.onValue(=>)
    input.end()
    dispose()
    bus.onValue(=>) # this latter subscription should not go to the ended source anymore
    expect(subscribed).toEqual(1)
  it "unsubscribes inputs on end() call", ->
    bus = new Bacon.Bus()
    input = new Bacon.Bus()
    events = []
    bus.plug(input)
    bus.subscribe((e) => events.push(e))
    input.push("a")
    bus.end()
    input.push("b")
    expect(events).toEqual([new Bacon.Next("a"), new Bacon.End()])
  it "handles cold single-event streams correctly (bug fix)", ->
    values = []
    bus = new Bacon.Bus()
    bus.plug(Bacon.once("x"))
    bus.plug(Bacon.once("y"))
    bus.onValue((x) -> values.push(x))
    expect(values).toEqual(["x", "y"])

  it "handles end() calls even when there are no subscribers", ->
    bus = new Bacon.Bus()
    bus.end()

  it "delivers pushed events and errors", ->
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
    expect(called).toEqual(false)

  it "does not plug after end() call", ->
    plugged = false
    bus = new Bacon.Bus()
    bus.end()
    bus.plug(new Bacon.EventStream((sink) -> plugged = true; (->)))
    bus.onValue(->)
    expect(plugged).toEqual(false)

lessThan = (limit) -> 
  (x) -> x < limit
times = (x, y) -> x * y
add = (x, y) -> x + y
id = (x) -> x

# Wrap EventEmitter as EventTarget
toEventTarget = (emitter) ->
  addEventListener: (event, handler) -> emitter.addListener(event, handler)
  removeEventListener: (event, handler) -> emitter.removeListener(event, handler)
