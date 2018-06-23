Bacon = require("../../dist/Bacon")
expect = require("chai").expect
{
  expectStreamEvents,
  expectPropertyEvents,
  series,
  error,
  semiunstable
} = require("../SpecHelper")

describe "EventStream.flatMapFirst", ->
  describe "spawns new streams and ignores source events until current spawned stream has ended", ->
    expectStreamEvents(
      -> series(2, [2, 4, 6, 8]).flatMapFirst (value) ->
        series(1, ["a" + value, "b" + value, "c" + value])
      ["a2", "b2", "c2", "a6", "b6", "c6"], semiunstable)
  it "toString", ->
    expect(Bacon.never().flatMapFirst(->).toString()).to.equal("Bacon.never().flatMapFirst(function)")
