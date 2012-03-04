Bacon = (require "../src/Bacon").Bacon
describe "later", ->
  it "should send single event and end", ->
    expectStreamEvents(
      -> Bacon.later(10, "lol")
      ["lol"])

describe "sequentially", ->
  it "should send given events and end", ->
    expectStreamEvents(
      -> Bacon.sequentially(10, ["lol", "wut"])
      ["lol", "wut"])

describe "interval", ->
  it "repeats single element indefinitely", ->
    expectStreamEvents(
      -> Bacon.interval(10, "x").take(3)
      ["x", "x", "x"])

describe "filter", -> 
  it "should filter values", ->
    expectStreamEvents(
      -> repeat(10, [1, 2, 3]).take(3).filter(lessThan(3))
      [1, 2])

describe "map", ->
  it "should map with given function", ->
    expectStreamEvents(
      -> repeat(10, [1, 2, 3]).take(3).map((x) -> x * 2)
      [2, 4, 6])

describe "takeWhile", ->
  it "should take while predicate is true", ->
    expectStreamEvents(
      -> repeat(10, [1, 2, 3]).takeWhile(lessThan(3))
      [1, 2])

describe "flatMap", ->
  it "should spawn new stream for each value and collect results into a single stream", ->
    expectStreamEvents(
      -> repeat(10, [1, 2]).take(2).flatMap (value) ->
        Bacon.sequentially(100, [value, value])
      [1, 2, 1, 2])

describe "merge", ->
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

describe "takeUntil", ->
  it "takes elements from source until an event appears in the other stream", ->
    expectStreamEvents(
      ->
        src = repeat(30, [1, 2, 3])
        stopper = repeat(70, ["stop!"])
        src.takeUntil(stopper)
      [1, 2])

describe "pushStream", ->
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


describe "subscribe and onValue", ->
  it "returns a dispose() for unsubscribing", ->
    s = Bacon.pushStream()
    values = []
    dispose = s.onValue (value) -> values.push value
    s.push "lol"
    dispose()
    s.push "wut"
    expect(values).toEqual(["lol"])

lessThan = (limit) -> 
  (x) -> x < limit

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

