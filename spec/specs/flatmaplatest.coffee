Bacon = require("../../dist/Bacon")
expect = require("chai").expect

{
  expectStreamEvents,
  expectPropertyEvents,
  error,
  fromArray,
  series,
  semiunstable,
  t
} = require("../SpecHelper")

describe "EventStream.flatMapLatest", ->
  describe "spawns new streams but collects values from the latest spawned stream only", ->
    expectStreamEvents(
      -> series(3, [1, 2]).flatMapLatest (value) ->
        series(t(2), [value, error(), value])
      [1, 2, error(), 2], semiunstable)
  describe "Accepts a constant EventStream/Property as an alternative to a function", ->
    expectStreamEvents(
      -> Bacon.once("asdf").flatMapLatest(Bacon.constant("bacon"))
      ["bacon"], semiunstable)
  it "toString", ->
    expect(Bacon.never().flatMapLatest(->).toString()).to.equal("Bacon.never().flatMapLatest(function)")

describe "Property.flatMapLatest", ->
  describe "spawns new streams but collects values from the latest spawned stream only", ->
    expectPropertyEvents(
      -> series(3, [1, 2]).toProperty(0).flatMapLatest (value) ->
        series(t(2), [value, value])
      [0, 1, 2, 2], semiunstable)
  describe "Accepts a constant EventStream/Property as an alternative to a function", ->
    expectPropertyEvents(
      -> Bacon.constant("asdf").flatMapLatest(Bacon.constant("bacon"))
      ["bacon"], semiunstable)
  it "toString", ->
    expect(Bacon.constant(1).flatMapLatest(->).toString()).to.equal("Bacon.constant(1).flatMapLatest(function)")
