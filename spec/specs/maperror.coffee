require("../../src/maperror")
Bacon = require("../../src/core").default
expect = require("chai").expect

{
  expectStreamEvents,
  take,
  repeat,
  error,
  id
} = require("../SpecHelper")

describe "EventStream.mapError", ->
  describe "should map error events with given function", ->
    expectStreamEvents(
        -> take(2, repeat(1, [1, error("OOPS")]).mapError(id))
        [1, "OOPS"])
  describe "also accepts a constant value", ->
    expectStreamEvents(
        -> take(2, repeat(1, [1, error()]).mapError("ERR"))
        [1, "ERR"])
  it "toString", ->
    expect(Bacon.never().mapError(true).toString()).to.equal("Bacon.never().mapError(function)")
