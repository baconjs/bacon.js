Bacon = require("../../dist/Bacon")
expect = require("chai").expect

{
  expectStreamEvents,
  expectPropertyEvents,
  testSideEffects,
  unstable,
  error,
  once,
  fromArray,
  series,
  skip,
  later,
  map,
  deferred
} = require("../SpecHelper")

describe "EventStream constructor", ->
  it "Provides a way to create a new EventStream", ->
    values = []
    subscribe = (sink) ->
      sink(new Bacon.Next("hello"))
      sink(new Bacon.End())
      ->
    s = new Bacon.EventStream(new Bacon.Desc("context", "method", ["arg"]), subscribe)
    s.onValue((x) -> values.push(x))
    expect(s.toString()).to.equal("context.method(arg)")
    deferred -> expect(values).to.deep.equal(["hello"])

describe "Observable.name", ->
  it "sets return value of toString and inspect", ->
    expect(Bacon.never().name("one").toString()).to.equal("one")
    expect(Bacon.never().name("one").inspect()).to.equal("one")
  it "modifies the stream in place", ->
    obs = Bacon.never()
    obs.name("one")
    expect(obs.toString()).to.equal("one")
  it "supports composition", ->
    expect(Bacon.never().name("raimo").toProperty().inspect()).to.equal("raimo.toProperty()")

describe "Observable.withDescription", ->
  it "affects toString and inspect", ->
    expect(Bacon.never().withDescription(Bacon, "una", "mas").inspect()).to.equal("Bacon.una(mas)")
  it "affects desc", ->
    description = Bacon.never().withDescription(Bacon, "una", "mas").desc
    expect(description.context).to.equal(Bacon)
    expect(description.method).to.equal("una")
    expect(description.args).to.deep.equal(["mas"])

describe "EventStream.subscribe", ->
  it "asserts that argument is function", ->
    f = -> Bacon.never().subscribe("a string")
    expect(f).to.throw(Error)

describe "EventStream.onValue", testSideEffects(once, "onValue")
describe "EventStream.forEach", testSideEffects(once, "forEach")
describe "Bacon.never", ->
  describe "should send just end", ->
    expectStreamEvents(
      -> Bacon.never()
      [])
