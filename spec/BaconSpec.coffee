Bacon = (require "../src/Bacon").Bacon

describe "later", ->
  it "should send single event and end", ->
    expectEvents(
      Bacon.later(1000, "lol")
      ["lol"])

describe "sequentially", ->
  it "should send given events and end", ->
    expectEvents(
      Bacon.sequentially(1000, ["lol", "wut"])
      ["lol", "wut"])

describe "filter", -> 
  it "should filter values", ->
    expectEvents(
      Bacon.sequentially(1000, ["lol", "wut"]).filter((x) -> x == "wut")
      ["wut"])

describe "map", ->
  it "should map with given function", ->
    expectEvents(
      Bacon.sequentially(1000, ["lol", "wut"]).map((x) -> x + "!")
      ["lol!", "wut!"])

describe "takeWhile", ->
  it "should take while predicate is true", ->
    expectEvents(
      Bacon.sequentially(1000, [1, 2, 3, 1]).takeWhile((x) -> x < 3)
      [1, 2])

describe "merge", ->
  it "merges two streams and ends when both are exhausted", ->
    left = Bacon.sequentially(100, [1, 2, 3])
    right = Bacon.sequentially(1000, [4, 5, 6])
    expectEvents(
      left.merge(right)
      [1, 2, 3, 4, 5, 6])

describe "pushStream", ->
  it "delivers pushed events", ->
    s = Bacon.pushStream()
    s.push "pullMe"
    expectEvents s, ["pushMe"]
    s.push "pushMe"
    s.end()

describe "Property", ->
  it "delivers current value and changes to subscribers", ->
    s = Bacon.pushStream()
    p = s.toProperty()
    s.push "a"
    expectEvents p, ["a", "b"]
    s.push "b"
    s.end()

expectEvents = (src, expectedEvents) ->
  events = []
  verify = -> expect(events).toEqual(expectedEvents.concat([Bacon.end]))
  t = setTimeout verify, 5000
  src.subscribe (event) ->
    events.push(event)
    if event == Bacon.end
      clearTimeout t
      verify
