require("../../src/take")
Bacon = require("../../src/core").default
expect = require("chai").expect

{
  expectStreamEvents,
  expectPropertyEvents,
  series,
  repeat,
  repeatedly,
  unstable,
  fromArray,
  t,
  once,
  verifySingleSubscriber
} = require("../SpecHelper")

describe "EventStream.take", ->
  describe "takes N first elements", ->
    expectStreamEvents(
      -> series(1, [1,2,3,4]).take(2)
      [1,2])
  describe "works with N=0", ->
    expectStreamEvents(
      -> series(1, [1,2,3,4]).take(0)
      [])
  describe "will stop properly even when exception thrown by subscriber", ->
    expectStreamEvents(
      ->
        s = repeatedly(t(1), ["lol", "wut"]).take(2)
        s.onValue (value) ->
          throw "testing" if value == "lol" # special string that will be catched by TickScheduler
        s
      ["wut"], unstable) # the outputs don't really matter - it's just that the stream terminates normally
  describe "works with asynchronous fromArray source", ->
    expectStreamEvents(
      -> fromArray([1,2,3,4]).take(2)
      [1,2])

    stream = fromArray([1,2,3,4])
    verifySingleSubscriber(
      -> stream.take(2)
      [1, 2])
    verifySingleSubscriber(
      -> stream.take(2)
      [3, 4])
    verifySingleSubscriber(
      -> stream.take(2)
      [])

    streamToo = fromArray([1,2])
    verifySingleSubscriber(
      -> streamToo.take(4)
      [1, 2])
    verifySingleSubscriber(
      -> streamToo.take(2)
      [])

  it "toString", ->
    expect(Bacon.never().take(1).toString()).to.equal("Bacon.never().take(1)")

describe "Property.take(1)", ->
  describe "takes the Initial event", ->
    expectPropertyEvents(
      -> series(1, [1,2,3]).toProperty(0).take(1)
      [0])
  describe "takes the first Next event, if no Initial value", ->
    expectPropertyEvents(
      -> series(1, [1,2,3]).toProperty().take(1)
      [1])
  describe "works for constants", ->
    expectPropertyEvents(
      -> Bacon.constant(1)
      [1])
  describe "works for never-ending Property", ->
    expectPropertyEvents(
      -> repeat(1, [1,2,3]).toProperty(0).take(1)
      [0])
    expectPropertyEvents(
      -> repeat(1, [1,2,3]).toProperty().take(1)
      [1])

describe "Bacon.once().take(1)", ->
  describe "works", ->
    expectStreamEvents(
      -> once(1).take(1)
      [1])
