Bacon = require("../../dist/Bacon")
expect = require("chai").expect
{ mockFunction, mock } = require( "../Mock")

{
  expectStreamEvents,
  expectPropertyEvents,
  error,
  fromArray,
  series,
  map,
  id,
  semiunstable,
  unstable,
  testSideEffects
} = require("../SpecHelper")

describe "Bacon.constant", ->
  describe "creates a constant property", ->
    expectPropertyEvents(
      -> Bacon.constant("lol")
    ["lol"])
  it "ignores unsubscribe", ->
    Bacon.constant("lol").onValue(=>)()
  describe "provides same value to all listeners", ->
    c = Bacon.constant("lol")
    expectPropertyEvents((-> c), ["lol"])
    it "check check", ->
      f = mockFunction()
      c.onValue(f)
      f.verify("lol")
  it "provides same value to all listeners, when mapped (bug fix)", ->
    c = map(Bacon.constant("lol"), id)
    f = mockFunction()
    c.onValue(f)
    f.verify("lol")
    c.onValue(f)
    f.verify("lol")
  it "toString", ->
    expect(Bacon.constant(1).toString()).to.equal("Bacon.constant(1)")

describe "Property.toEventStream", ->
  describe "creates a stream that starts with current property value", ->
    expectStreamEvents(
      -> series(1, [1, 2]).toProperty(0).toEventStream()
      [0, 1, 2], semiunstable)
  describe "works with synchronous source", ->
    expectStreamEvents(
      -> fromArray([1, 2]).toProperty(0).toEventStream()
      [0, 1, 2], unstable)

describe "Property.toProperty", ->
  describe "returns the same Property", ->
    expectPropertyEvents(
      -> Bacon.constant(1).toProperty()
      [1])
  it "rejects arguments", ->
    try
      Bacon.constant(1).toProperty(0)
      fail()
    catch e

describe "Property.subscribe", ->
  it "asserts that argument is function", ->
    f = -> Bacon.never().toProperty().subscribe("a string")
    expect(f).to.throw(Error)

describe "Property.changes", ->
  describe "sends property change events", ->
    expectStreamEvents(
      ->
        p = series(1, ["b", new Bacon.Error()]).toProperty("a").changes()
      ["b", error()])
  describe "works with synchronous source", ->
    expectStreamEvents(
      -> fromArray([1, 2, 3]).toProperty(0).changes()
      [1, 2, 3])

describe "Observable.onValues", ->
  it "splits value array to callback arguments", ->
    f = mockFunction()
    Bacon.constant([1,2,3]).onValues(f)
    f.verify(1,2,3)

describe "Property.onValue", testSideEffects(Bacon.constant, "onValue")
