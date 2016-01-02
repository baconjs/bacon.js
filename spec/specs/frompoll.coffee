require("../../src/frompoll")
Bacon = require("../../src/core").Bacon
expect = require("chai").expect
{ expectStreamEvents, take } = require("../SpecHelper")

describe "Bacon.fromPoll", ->
  describe "repeatedly polls given function for values", ->
    expectStreamEvents(
      -> take 2, Bacon.fromPoll(1, (-> "lol"))
      ["lol", "lol"])
  it "toString", ->
    expect(Bacon.fromPoll(1, (->)).toString()).to.equal("Bacon.fromPoll(1,function)")
