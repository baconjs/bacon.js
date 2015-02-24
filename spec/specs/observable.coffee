# build-dependencies: bus

describe "Observable.onEnd", ->
  it "is called on stream end", ->
    s = new Bacon.Bus()
    ended = false
    s.onEnd(-> ended = true)
    s.push("LOL")
    expect(ended).to.deep.equal(false)
    s.end()
    expect(ended).to.deep.equal(true)

describe "Observable.onValue, onError, onEnd", ->
  it "are chainable", ->
    result = ""
    s = new Bacon.Bus()
    s.onValue((x) -> result = result + x)
     .onError((e) -> result = result + e)
     .onEnd(-> result = result + "end")
     .onValue((x) -> result = result + x)
    s.push("value")
    s.error("error")
    s.end()
    expect(result).to.equal("valuevalueerrorend")
