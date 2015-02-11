# build-dependencies: property

describe "EventStream.toProperty", ->
  describe "delivers current value and changes to subscribers", ->
    expectPropertyEvents(
      -> later(1, "b").toProperty("a")
      ["a", "b"])
  describe "passes through also Errors", ->
    expectPropertyEvents(
      -> series(1, [1, error(), 2]).toProperty()
      [1, error(), 2])

  describe "supports null as value", ->
    expectPropertyEvents(
      -> series(1, [null, 1, null]).toProperty(null)
      [null, null, 1, null])

  describe "does not get messed-up by a transient subscriber (bug fix)", ->
    expectPropertyEvents(
      ->
        prop = series(1, [1,2,3]).toProperty(0)
        prop.subscribe (event) =>
          Bacon.noMore
        prop
      [0, 1, 2, 3])
  describe "works with synchronous source", ->
    expectPropertyEvents(
      -> fromArray([1,2,3]).toProperty()
      [1,2,3])
    expectPropertyEvents(
      -> fromArray([1,2,3]).toProperty(0)
      [0,1,2,3], unstable)
  it "preserves laziness", ->
    calls = 0
    id = (x) ->
      calls++
      x
    skip(4, map(fromArray([1,2,3,4,5]), id).toProperty()).onValue()
    expect(calls).to.equal(1)
  it "toString", ->
    expect(Bacon.never().toProperty(0).toString()).to.equal("Bacon.never().toProperty(0)")

describe "Observable.name", ->
  it "sets return value of toString and inspect", ->
    expect(Bacon.never().name("one").toString()).to.equal("one")
    expect(Bacon.never().name("one").inspect()).to.equal("one")
  it "modifies the stream in place", ->
    obs = Bacon.never()
    obs.name("one")
    expect(obs.toString()).to.equal("one")
  it "supports composition", ->
    expect(Bacon.never().name("raimo").toProperty().inspect()).to.equal("raimo.toProperty(undefined)")

describe "Observable.withDescription", ->
  it "affects toString and inspect", ->
    expect(Bacon.never().withDescription(Bacon, "una", "mas").inspect()).to.equal("Bacon.una(mas)")
  it "affects desc", ->
    description = Bacon.never().withDescription(Bacon, "una", "mas").desc
    expect(description.context).to.equal(Bacon)
    expect(description.method).to.equal("una")
    expect(description.args).to.deep.equal(["mas"])

describe "EventStream.onValue", testSideEffects(once, "onValue")
describe "EventStream.forEach", testSideEffects(once, "forEach")

describe "Observable.subscribe and onValue", ->
  it "returns a dispose() for unsubscribing", ->
    s = new Bacon.Bus()
    values = []
    dispose = s.onValue (value) -> values.push value
    s.push "lol"
    dispose()
    s.push "wut"
    expect(values).to.deep.equal(["lol"])
  it "respects returned Bacon.noMore return value (#523)", ->
    calls = 0
    Bacon.once(1).merge(Bacon.interval(100, 2)).subscribe (event) ->
      calls++
      Bacon.noMore
    expect(calls).to.equal(1)
    # will hang if the underlying interval-stream isn't disposed correctly
