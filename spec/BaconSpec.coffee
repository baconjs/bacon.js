Bacon = (require "../src/Bacon").Bacon

describe "Bacon.later", ->
  it "should send single event and end", ->
    expectStreamEvents(
      -> Bacon.later(10, "lol")
      ["lol"])

describe "Bacon.sequentially", ->
  it "should send given events and end", ->
    expectStreamEvents(
      -> Bacon.sequentially(10, ["lol", "wut"])
      ["lol", "wut"])

describe "Bacon.interval", ->
  it "repeats single element indefinitely", ->
    expectStreamEvents(
      -> Bacon.interval(10, "x").take(3)
      ["x", "x", "x"])

describe "EventStream.filter", -> 
  it "should filter values", ->
    expectStreamEvents(
      -> repeat(10, [1, 2, 3]).take(3).filter(lessThan(3))
      [1, 2])

describe "EventStream.map", ->
  it "should map with given function", ->
    expectStreamEvents(
      -> repeat(10, [1, 2, 3]).take(3).map(times(2))
      [2, 4, 6])

describe "EventStream.end", ->
  it "produces single-element stream on stream end", ->
    expectStreamEvents(
      -> repeat(10, [""]).take(2).end("the end")
      ["the end"])
  it "defaults to the string 'end' if no value given", ->
    expectStreamEvents(
      -> repeat(10, [""]).take(2).end()
      ["end"])

describe "EventStream.takeWhile", ->
  it "should take while predicate is true", ->
    expectStreamEvents(
      -> repeat(10, [1, 2, 3]).takeWhile(lessThan(3))
      [1, 2])

describe "EventStream.skip", ->
  it "should skip first N items", ->
    expectStreamEvents(
      -> repeat(10, [1, 2, 3]).take(3).skip(1)
    [2, 3])

describe "EventStream.distinctUntilChanged", ->
  it "drops duplicates", ->
    expectStreamEvents(
      -> repeat(10, [1, 2, 2, 3, 1]).take(5).distinctUntilChanged()
    [1, 2, 3, 1])

describe "EventStream.flatMap", ->
  it "should spawn new stream for each value and collect results into a single stream", ->
    expectStreamEvents(
      -> repeat(10, [1, 2]).take(2).flatMap (value) ->
        Bacon.sequentially(100, [value, value])
      [1, 2, 1, 2])

describe "EventStream.switch", ->
  it "spawns new streams but collects values from the latest spawned stream only", ->
    expectStreamEvents(
      -> repeat(30, [1, 2]).take(2).switch (value) ->
        Bacon.sequentially(20, [value, value])
      [1, 2, 2])

describe "EventStream.merge", ->
  it "merges two streams and ends when both are exhausted", ->
    expectStreamEvents( 
      ->
        left = repeat(10, [1, 2, 3]).take(3)
        right = repeat(100, [4, 5, 6]).take(3)
        left.merge(right)
      [1, 2, 3, 4, 5, 6])
  it "respects subscriber return value", ->
    expectStreamEvents(
      ->
        left = repeat(20, [1, 3]).take(3)
        right = repeat(30, [2]).take(3)
        left.merge(right).takeWhile(lessThan(2))
      [1])

describe "EventStream.delay", ->
  it "delays all events by given delay in milliseconds", ->
    expectStreamEvents(
      ->
        left = repeat(20, [1, 2, 3]).take(3)
        right = repeat(10, [4, 5, 6]).delay(100).take(3)
        left.merge(right)
      [1, 2, 3, 4, 5, 6])

describe "EventStream.throttle", ->
  it "throttles input by given delay", ->
    expectStreamEvents(
      -> repeat(10, [1, 2]).take(2).throttle(20)
      [2])

describe "EventStream.bufferWithTime", ->
  it "returns events in bursts", ->
    expectStreamEvents(
      -> repeat(10, [1, 2, 3, 4, 5, 6, 7]).take(7).bufferWithTime(33)
      [[1, 2, 3, 4], [5, 6, 7]])

describe "EventStream.bufferWithCount", ->
  it "returns events in chunks of fixed size", ->
    expectStreamEvents(
      -> repeat(10, [1, 2, 3, 4, 5]).take(5).bufferWithCount(2)
      [[1, 2], [3, 4], [5]])

describe "EventStream.takeUntil", ->
  it "takes elements from source until an event appears in the other stream", ->
    expectStreamEvents(
      ->
        src = repeat(30, [1, 2, 3])
        stopper = repeat(70, ["stop!"])
        src.takeUntil(stopper)
      [1, 2])

describe "EventStream.decorateWithProperty", ->
  it "decorates stream event with Property value", ->
    expectStreamEvents(
      ->
        repeat(10, [{i:0}, {i:1}]).decorateWith("label", Bacon.constant("lol")).take(2)
      [{i:0, label:"lol"}, {i:1, label:"lol"}])

describe "Bacon.pushStream", ->
  it "delivers pushed events", ->
    expectStreamEvents(
      ->
        s = Bacon.pushStream()
        s.push "pullMe"
        soon ->
          s.push "pushMe"
          s.end()
        s
      ["pushMe"])

describe "Property", ->
  it "delivers current value and changes to subscribers", ->
    expectPropertyEvents(
      ->
        s = Bacon.pushStream()
        p = s.toProperty("a")
        soon ->
          s.push "b"
          s.end()
        p
      ["a", "b"])
  it "passes through also 'undefined' values", ->
    expectPropertyEvents(
      -> repeat(10, [1, undefined, 2]).take(3).toProperty()
      [1, undefined, 2])
  it "delivers also 'undefined' as Initial value", ->
    # TODO: how to test this?

describe "Bacon.constant", ->
  it "creates a constant property", ->
    expectPropertyEvents(
      -> Bacon.constant("lol")
    ["lol"])

describe "Property.map", ->
  it "maps property values", ->
    expectPropertyEvents(
      ->
        s = Bacon.pushStream()
        p = s.toProperty(1).map(times(2))
        soon ->
          s.push 2
          s.end()
        p
      [2, 4])

describe "Property.filter", -> 
  it "should filter values", ->
    expectPropertyEvents(
      -> repeat(10, [1, 2, 3]).take(3).toProperty().filter(lessThan(3))
      [1, 2])


describe "Property.takeUntil", ->
  it "takes elements from source until an event appears in the other stream", ->
    expectPropertyEvents(
      ->
        src = repeat(30, [1, undefined, 3])
        stopper = repeat(70, ["stop!"])
        src.toProperty(0).takeUntil(stopper)
      [0, 1, undefined])

describe "Property.changes", ->
  it "sends property change events", ->
    expectPropertyEvents(
      ->
        s = Bacon.pushStream()
        p = s.toProperty("a").changes()
        soon ->
          s.push "b"
          s.end()
        p
      ["b"])

describe "Property.combine", ->
  it "combines latest values of two properties", ->
    expectPropertyEvents( 
      ->
        left = repeat(20, [1, 2, 3]).take(3).toProperty()
        right = repeat(20, [4, 5, 6]).delay(10).take(3).toProperty()
        left.combine(right, add)
      [5, 6, 7, 8, 9])

describe "Bacon.combineAsArray", -> 
  it "combines properties and latest values of streams, into a Property having arrays as values", ->
    expectPropertyEvents(
      ->
        stream = repeat(10, ["a", "b"]).take(2)
        Bacon.combineAsArray([Bacon.constant(1), Bacon.constant(2), stream])
      [[1, 2, "a"], [1, 2, "b"]])

describe "Bacon.mergeAll", ->
  it ("merges all given streams"), ->
    expectStreamEvents(
      ->
        Bacon.mergeAll([
          repeat(30, [1, 2]).take(2)
          repeat(30, [3, 4]).delay(10).take(2)
          repeat(30, [5, 6]).delay(20).take(2)])
      [1, 3, 5, 2, 4, 6])

describe "Property.sampledBy", -> 
  it "samples property at events, resulting to EventStream", ->
    expectStreamEvents(
      ->
        prop = repeat(20, [1, 2]).take(2).toProperty()
        stream = repeat(30, ["troll"]).take(4)
        prop.sampledBy(stream)
      [1, 2, 2, 2])
  it "ends when sampling stream ends", ->
    expectStreamEvents(
      ->
        prop = repeat(20, [1, 2]).toProperty()
        stream = repeat(20, [""]).delay(10).take(4)
        prop.sampledBy(stream)
      [1, 2, 1, 2])
  it "accepts optional combinator function f(Vp, Vs)", ->
    expectStreamEvents(
      ->
        prop = repeat(20, ["a", "b"]).take(2).toProperty()
        stream = repeat(20, ["1", "2"]).delay(10).take(4)
        prop.sampledBy(stream, add)
      ["a1", "b2", "b1", "b2"])

describe "Property.sample", -> 
  it "samples property by given interval", ->
    expectStreamEvents(
      ->
        prop = repeat(20, [1, 2]).take(2).toProperty()
        prop.sample(30).take(4)
      [1, 2, 2, 2])

describe "Bacon.latestBalue(property)()", ->
  it "returns current value of property", ->
    expect(Bacon.latestValue(Bacon.constant(1))()).toEqual(1)

describe "EventStream.scan", ->
  it "accumulates values with given seed and accumulator function", ->
    expectPropertyEvents(
      -> repeat(10, [1, 2, 3]).take(3).scan(0, add)
      [0, 1, 3, 6])

describe "Observable.subscribe and onValue", ->
  it "returns a dispose() for unsubscribing", ->
    s = Bacon.pushStream()
    values = []
    dispose = s.onValue (value) -> values.push value
    s.push "lol"
    dispose()
    s.push "wut"
    expect(values).toEqual(["lol"])

describe "Bacon.Bus", ->
  it "merges plugged-in streams", ->
    bus = new Bacon.Bus()
    values = []
    dispose = bus.onValue (value) -> values.push value
    push = Bacon.pushStream()
    bus.plug(push)
    push.push("lol")
    expect(values).toEqual(["lol"])
    dispose()
    verifyCleanup()
  it "works with looped streams", ->
    expectStreamEvents(
      ->
        bus = new Bacon.Bus()
        bus.plug(Bacon.later(20, "lol"))
        bus.plug(bus.filter((value) => "lol" == value).map(=> "wut"))
        Bacon.later(40).onValue(=> bus.end())
        bus
      ["lol", "wut"])
  it "dispose works with looped streams", ->
    bus = new Bacon.Bus()
    bus.plug(Bacon.later(20, "lol"))
    bus.plug(bus.filter((value) => "lol" == value).map(=> "wut"))
    dispose = bus.onValue(=>)
    dispose()
  it "cleans up input list on end", ->
    subscribed = 0
    bus = new Bacon.Bus()
    input = Bacon.pushStream()
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

lessThan = (limit) -> 
  (x) -> x < limit

times = (factor) ->
  (x) -> x * factor

add = (x, y) -> x + y

expectPropertyEvents = (src, expectedEvents) ->
  runs -> verifySingleSubscriber src(), expectedEvents

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
      events.push(event.value)

  waitsFor streamEnded, 1000
  runs -> 
    expect(events).toEqual(expectedEvents)
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
        events.push(event.value)
        src.subscribe(newSink())
        Bacon.noMore
  runs -> 
    src.subscribe(newSink())
  waitsFor streamEnded, 1000
  runs -> 
    expect(events).toEqual(expectedEvents)
    verifyCleanup()

seqs = []
soon = (f) -> setTimeout f, 100
repeat = (interval, values) ->
  source = Bacon.repeatedly(interval, values)
  seqs.push({ values : values, source : source })
  source

verifyCleanup = ->
  for seq in seqs
    #console.log("verify cleanup: #{seq.values}")
    expect(seq.source.hasSubscribers()).toEqual(false)
  seqs = []

