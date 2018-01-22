require("../../src/concat")
Bacon = require("../../src/core").default
expect = require("chai").expect
{
  expectStreamEvents,
  expectPropertyEvents,
  series,
  error,
  semiunstable
} = require("../SpecHelper")

describe "EventStream.flatMapEvent", ->
  describe "should spawn new stream for each event (value or error) and collect results into a single stream", ->
    expectStreamEvents(
      -> series(1, [1, new Bacon.Error()]).flatMapEvent (event) ->
        if event.hasValue()
          event.value + 1
        else if event.isError()
          "error handled"
          
      [2, "error handled"], semiunstable)
  
  it "toString", ->
    expect(Bacon.never().flatMapEvent(->).toString()).to.equal("Bacon.never().flatMapEvent(function)")
