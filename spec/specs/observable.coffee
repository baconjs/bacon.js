require("../../src/bus")
Bacon = require("../../src/bacon").Bacon
expect = require("chai").expect

describe "Observable.onEnd", ->
  it "is called on stream end", ->
    s = new Bacon.Bus()
    ended = false
    s.onEnd(-> ended = true)
    s.push("LOL")
    expect(ended).to.deep.equal(false)
    s.end()
    expect(ended).to.deep.equal(true)
