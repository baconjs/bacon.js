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
      Bacon.sequentially(1000, ["lol", "wut"]).filter((x) -> x == "lol")
      ["lol", "wut"])

expectEvents = (src, expectedEvents) ->
  events = []
  src.subscribe (event) ->
    if event == Bacon.end
      expect(events).toEqual(expectedEvents)
    else
      events.push(event)
