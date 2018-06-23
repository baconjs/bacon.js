Bacon = require("../../dist/Bacon")
expect = require("chai").expect
{ mockFunction, mock } = require( "../Mock")

{
  expectStreamEvents,
  fromArray,
  series,
  semiunstable,
  unstable,
  deferred
} = require("../SpecHelper")

describe "Property.toEventStream", ->
  describe "creates a stream that starts with current property value", ->
    expectStreamEvents(
      -> series(1, [1, 2]).toProperty(0).toEventStream()
      [0, 1, 2], semiunstable)
  describe "works with synchronous source", ->
    expectStreamEvents(
      -> fromArray([1, 2]).toProperty(0).toEventStream()
      [0, 1, 2], unstable)
  it "responds asynchronously", ->
    sync = false
    vals = Bacon.interval(150)
      .scan(0, (x) -> x + 1)
      .toEventStream()
    vals.take(1).onValue -> sync = true
    expect(sync).to.equal(false)
    deferred ->
      expect(sync).to.equal(true)
