require("../../src/frombinder")
Bacon = require("../../src/core").Bacon
expect = require("chai").expect

{
  expectStreamEvents,
  error
} = require("../SpecHelper")

describe "Bacon.fromBinder", ->
  describe "Provides an easier alternative to the EventStream constructor, allowing sending multiple events at a time", ->
    expectStreamEvents(
      ->
        Bacon.fromBinder (sink) ->
          sink([new Bacon.Next(1), new Bacon.End()])
          (->)
      [1])
  describe "Allows sending unwrapped values as well as events", ->
    expectStreamEvents(
      ->
        Bacon.fromBinder (sink) ->
          sink([1, new Bacon.End()])
          (->)
      [1])
  describe "Allows sending single value without wrapping array", ->
    expectStreamEvents(
      ->
        Bacon.fromBinder (sink) ->
          sink(1)
          sink(new Bacon.End())
          (->)
      [1])
  describe "unbind works in synchronous case", ->
    expectStreamEvents( ->
        Bacon.fromBinder (sink) ->
          unsubTest = Bacon.scheduler.setInterval((->), 10)
          sink("hello")
          sink(new Bacon.End())
          ->
            # test hangs if any interval is left uncleared
            Bacon.scheduler.clearInterval(unsubTest)
      ,
      ["hello"])

  it "calls unbinder only once", ->
    unbound = 0
    output = undefined
    timer = Bacon.fromBinder((sink) ->
        output = sink
        -> unbound++
    )
    timer.onValue(-> Bacon.noMore)
    output "hello"
    expect(unbound).to.equal(1)

  it "toString", ->
    expect(Bacon.fromBinder(->).toString()).to.equal("Bacon.fromBinder(function,function)")
