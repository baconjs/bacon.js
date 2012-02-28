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

expectEvents = (src, expectedEvents) ->
  events = []
  verify = -> expect(events).toEqual(expectedEvents.concat([Bacon.end]))
  src.subscribe (event) ->
    events.push(event)
    verify if event == Bacon.end
  setTimeout verify 5000
