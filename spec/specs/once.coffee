require("../../src/once")
Bacon = require("../../src/bacon").Bacon
expect = require("chai").expect

{
  expectStreamEvents,
  error
} = require("../SpecHelper")

describe "Bacon.once", ->
  describe "should send single event and end", ->
    expectStreamEvents(
      -> Bacon.once("pow")
      ["pow"])
  describe "accepts an Error event as parameter", ->
    expectStreamEvents(
      -> Bacon.once(new Bacon.Error("oop"))
      [error()])
  describe "Allows wrapped events, for instance, Bacon.Error", ->
    expectStreamEvents(
      -> Bacon.once(error())
      [error()])
  it "Responds synchronously", ->
    values = []
    s = Bacon.once(1)
    s.onValue((value) => values.push(value))
    expect(values).to.deep.equal([1])
    s.onValue((value) => values.push(value))
    expect(values).to.deep.equal([1])
