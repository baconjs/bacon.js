Bacon = require("../../dist/Bacon")
expect = require("chai").expect
{ expectStreamEvents, take } = require("../SpecHelper")

describe "Bacon.fromPoll", ->
  describe "repeatedly polls given function for values", ->
    expectStreamEvents(
      -> take 2, Bacon.fromPoll(1, (-> "lol"))
      ["lol", "lol"])
  describe "supports returning Event objects", ->
    expectStreamEvents(
      -> take 2, Bacon.fromPoll(1, (-> new Bacon.Next(1)))
      [1, 1])
  describe "supports returning array of Event objects", ->
    expectStreamEvents(
      -> take 2, Bacon.fromPoll(1, (-> [new Bacon.Next(1)]))
      [1, 1])
  it "toString", ->
    expect(Bacon.fromPoll(1, (->)).toString()).to.equal("Bacon.fromPoll(1,function)")
