# build-dependencies: bus, once, map

describe "Observable::onValue", ->
  it "is chainable", ->
    values = []
    s = new Bacon.Bus()
    s.onValue((v) -> values.push(v))
     .onValue((v) -> values.push(-v))
    s.push(1)
    s.push(2)
    expect(values).to.deep.equal([1, -1, 2, -2])

describe "Observable::onEnd", ->
  it "is called on stream end", ->
    s = new Bacon.Bus()
    ended = false
    s.onEnd(-> ended = true)
    s.push("LOL")
    expect(ended).to.deep.equal(false)
    s.end()
    expect(ended).to.deep.equal(true)

describe "Meta-info", ->
  obs = Bacon.once(1).map(->)
  describe "Observable::desc", ->
    it "returns structured description", ->
      expect(obs.desc.method).to.equal("map")

  describe "Observable::deps", ->
    it "returns dependencies", ->
      expect(obs.deps().length).to.equal(1)
      expect(obs.deps()[0].toString()).to.equal("Bacon.once(1)")

  describe "Observable::internalDeps", ->
    it "returns \"real\" deps", ->
      expect(obs.deps().length).to.equal(1)
      expect(obs.deps()[0].toString()).to.equal("Bacon.once(1)")
