Bacon = (require "../src/Bacon").Bacon
describe "later", ->
  it "should send single event and end", ->
    expectEvents(
      Bacon.later(10, "lol")
      ["lol"])

describe "sequentially", ->
  it "should send given events and end", ->
    expectEvents(
      Bacon.sequentially(10, ["lol", "wut"])
      ["lol", "wut"])

describe "filter", -> 
  it "should filter values", ->
    expectEvents(
      Bacon.sequentially(10, ["lol", "wut"]).filter((x) -> x == "wut")
      ["wut"])

describe "map", ->
  it "should map with given function", ->
    expectEvents(
      Bacon.sequentially(10, ["lol", "wut"]).map((x) -> x + "!")
      ["lol!", "wut!"])

describe "takeWhile", ->
  it "should take while predicate is true", ->
    expectEvents(
      Bacon.sequentially(10, [1, 2, 3, 1]).takeWhile((x) -> x < 3)
      [1, 2])

describe "merge", ->
  it "merges two streams and ends when both are exhausted", ->
    left = Bacon.sequentially(10, [1, 2, 3])
    right = Bacon.sequentially(100, [4, 5, 6])
    expectEvents(
      left.merge(right)
      [1, 2, 3, 4, 5, 6])

describe "pushStream", ->
  it "delivers pushed events", ->
    s = Bacon.pushStream()
    s.push "pullMe"
    soon ->
      s.push "pushMe"
      s.end()
    expectEvents s, ["pushMe"]

describe "Property", ->
  it "delivers current value and changes to subscribers", ->
    s = Bacon.pushStream()
    p = s.toProperty("a")
    soon ->
      s.push "b"
      s.end()
    expectEvents p, ["a", "b"]

expectEvents = (src, expectedEvents) ->
  events = []
  ended = false
  streamEnded = -> ended
  runs -> src.subscribe (event) -> 
    if event.isEnd()
      ended = true
    else
      events.push(event.value)

  waitsFor streamEnded, 1000
  runs -> expect(events).toEqual(expectedEvents)

soon = (f) -> setTimeout f, 100
