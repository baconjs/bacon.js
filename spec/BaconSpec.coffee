Bacon = (require "../src/Bacon").Bacon
EventEmitter = require("events").EventEmitter

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

describe "EventStream.filter", -> 
  it "should filter values", ->
    expectStreamEvents(
      -> series(1, [1, 2, error(), 3]).filter(lessThan(3))
      [1, 2, error()])

describe "EventStream.map", ->
  it "should map with given function", ->
    expectStreamEvents(
      -> series(1, [1, 2, 3]).map(times(2))
      [2, 4, 6])
  it "also accepts a constant value", ->
    expectStreamEvents(
      -> series(1, [1, 2, 3,]).map("lol")
      ["lol", "lol", "lol"])
  it "..and a property value, starting with .", ->
    o = { lol : "wut" }
    expectStreamEvents(
      -> repeat(1, [o]).take(3).map(".lol")
      ["wut", "wut", "wut"])
  it "..and a property value, starting with ., where property is a function", ->
    o = { lol : -> "wut" }
    expectStreamEvents(
      -> repeat(1, [o]).take(3).map(".lol")
      ["wut", "wut", "wut"])

describe "EventStream.mapError", ->
  it "should map error events with given function", ->
    expectStreamEvents(
        -> repeat(1, [1, error("OOPS")]).mapError(id).take(2)
        [1, "OOPS"])
  it "also accepts a constant value", ->
    expectStreamEvents(
        -> repeat(1, [1, error()]).mapError("ERR").take(2)
        [1, "ERR"])

describe "EventStream.do", ->
  it "does not alter the stream", ->
    expectStreamEvents(
      -> series(1, [1, 2]).do(->)
      [1, 2])
  it "calls function before sending value to listeners", ->
    called = []
    bus = new Bacon.Bus()
    s = bus.do((x) -> called.push(x))
    s.onValue(->)
    s.onValue(->)
    bus.push(1)
    expect(called).toEqual([1])

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

describe "EventStream.switch", ->
  it "spawns new streams but collects values from the latest spawned stream only", ->
    expectStreamEvents(
      -> series(3, [1, 2]).switch (value) ->
        Bacon.sequentially(t(2), [value, error(), value])
      [1, 2, error(), 2])

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

describe "Property.map", ->
  it "maps property values", ->
    expectPropertyEvents(
      ->
        s = new Bacon.Bus()
        p = s.toProperty(1).map(times(2))
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


describe "Property.takeUntil", ->
  it "takes elements from source until an event appears in the other stream", ->
    expectPropertyEvents(
      ->
        src = repeat(2, [1, error(), 3])
        stopper = repeat(5, ["stop!"])
        src.toProperty(0).takeUntil(stopper)
      [0, 1, error()])

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

describe "Bacon.combineAsArray", -> 
  it "combines properties and latest values of streams, into a Property having arrays as values", ->
    expectPropertyEvents(
      ->
        stream = series(1, ["a", "b"])
        Bacon.combineAsArray([Bacon.constant(1), Bacon.constant(2), stream])
      [[1, 2, "a"], [1, 2, "b"]])
  it "works with single stream", ->
    expectPropertyEvents(
      ->
        Bacon.combineAsArray([Bacon.constant(1)])
      [[1]])

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
  it "works with same origin", ->
    expectStreamEvents(
      ->
        src = series(2, [1, 2])
        src.toProperty().sampledBy(src)
      [1, 2])
    expectStreamEvents(
      ->
        src = series(2, [1, 2])
        src.toProperty().sampledBy(src.map(times(2)))
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

describe "Property.assign", ->
  it "calls given objects given method with property values", ->
    called = undefined
    target = {
      pow: (value) -> called = value
    }
    Bacon.constant("kaboom").assign(target, "pow")
    expect(called).toEqual("kaboom")
  it "allows partial application of method (i.e. adding fixed args)", ->
    arg1 = undefined
    arg2 = undefined
    target = {
      pow: (a, b) -> arg1 = a; arg2 = b
    }
    Bacon.constant("kaboom").assign(target, "pow", "smack")
    expect(arg1).toEqual("smack")
    expect(arg2).toEqual("kaboom")
  it "allows partial application of method with 2 args (i.e. adding fixed args)", ->
    arg1 = undefined
    arg2 = undefined
    arg3 = undefined
    target = {
      pow: (a, b, c) -> arg1 = a; arg2 = b; arg3 = c
    }
    Bacon.constant("kaboom").assign(target, "pow", "smack", "whack")
    expect(arg1).toEqual("smack")
    expect(arg2).toEqual("whack")
    expect(arg3).toEqual("kaboom")

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

lessThan = (limit) -> 
  (x) -> x < limit

times = (factor) ->
  (x) -> x * factor

add = (x, y) -> x + y

always = (x) -> (-> x)

id = (x) -> x

expectPropertyEvents = (src, expectedEvents) ->
  events = []
  events2 = []
  ended = false
  streamEnded = -> ended
  property = src()
  runs -> property.subscribe (event) -> 
    if event.isEnd()
      ended = true
    else
      events.push(toValue(event))
      if event.hasValue()
        property.subscribe (event) ->
          if event.isInitial()
            events2.push(event.value)
          Bacon.noMore
  waitsFor streamEnded, t(50)
  runs -> 
    expect(events).toEqual(toValues(expectedEvents))
    expect(events2).toEqual(justValues(expectedEvents))
    verifyCleanup()

expectStreamEvents = (src, expectedEvents) ->
  runs -> verifySingleSubscriber src(), expectedEvents
  runs -> verifySwitching src(), expectedEvents

verifySingleSubscriber = (src, expectedEvents) ->
  events = []
  ended = false
  streamEnded = -> ended
  runs -> src.subscribe (event) -> 
    if event.isEnd()
      ended = true
    else
      events.push(toValue(event))

  waitsFor streamEnded, t(50)
  runs -> 
    expect(events).toEqual(toValues(expectedEvents))
    verifyCleanup()

# get each event with new subscriber
verifySwitching = (src, expectedEvents) ->
  events = []
  ended = false
  streamEnded = -> ended
  newSink = -> 
    (event) ->
      if event.isEnd()
        ended = true
      else
        events.push(toValue(event))
        src.subscribe(newSink())
        Bacon.noMore
  runs -> 
    src.subscribe(newSink())
  waitsFor streamEnded, t(50)
  runs -> 
    expect(events).toEqual(toValues(expectedEvents))
    verifyCleanup()

error = (msg) -> new Bacon.Error(msg)
seqs = []
soon = (f) -> setTimeout f, t(1)
timeUnitMillisecs = 5
series = (interval, values) ->
  Bacon.sequentially(t(interval), values)
repeat = (interval, values) ->
  source = Bacon.repeatedly(interval * timeUnitMillisecs, values)
  seqs.push({ values : values, source : source })
  source
t = (time) -> time * timeUnitMillisecs

verifyCleanup = ->
  for seq in seqs
    #console.log("verify cleanup: #{seq.values}")
    expect(seq.source.hasSubscribers()).toEqual(false)
  seqs = []

toValues = (xs) ->
  values = []
  for x in xs
    values.push(toValue(x))
  values
toValue = (x) ->
  if x? and x.isEvent?
    if x.isError()
      "<error>"
    else
      x.value
  else
    x
filter = (f, xs) ->
  filtered = []
  for x in xs
    filtered.push(x) if f(x)
  filtered
justValues = (xs) ->
  filter hasValue, xs
hasValue = (x) ->
  toValue(x) != "<error>"

# Wrap EventEmitter as EventTarget
toEventTarget = (emitter) ->
  addEventListener: (event, handler) -> emitter.addListener(event, handler)
  removeEventListener: (event, handler) -> emitter.removeListener(event, handler)
