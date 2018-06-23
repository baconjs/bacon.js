Bacon = require("../../dist/Bacon")
expect = require("chai").expect

{
  expectStreamEvents,
  expectPropertyEvents,
  series,
  error,
  once,
  take,
  times,
  repeat,
  fromArray,
  deferred
} = require("../SpecHelper")
times2 = (x) => x * 2
describe "Property.map", ->
  describe "maps property values", ->
    expectPropertyEvents(
      ->
        series(1, [2, new Bacon.Error()]).toProperty(1).map(times2)
      [2, 4, error()])

describe "EventStream.map", ->
  describe "should map with given function", ->
    expectStreamEvents(
      -> series(1, [1, 2, 3]).map(times2)
      [2, 4, 6])
  describe "also accepts a constant value", ->
    expectStreamEvents(
      -> series(1, [1, 2, 3,]).map("lol")
      ["lol", "lol", "lol"])
  describe "can map to a Property value", ->
    expectStreamEvents(
      -> series(1, [1,2,3]).map(Bacon.constant(2))
      [2,2,2])
  it "toString", ->
    expect(Bacon.never().map(true).toString()).to.equal("Bacon.never().map(true)")
