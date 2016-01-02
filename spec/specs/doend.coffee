# build-dependencies: bus
require("../../src/bus")
require("../../src/doend")
Bacon = require("../../src/core").Bacon
expect = require("chai").expect

{
  expectStreamEvents,
  series
} = require("../SpecHelper")


describe "EventStream.doEnd", ->
  it "calls function before sending end to listeners", ->
    called = []
    bus = new Bacon.Bus()
    s = bus.doEnd(-> called.push(1))
    s.onEnd(-> called.push(2))
    bus.end()
    expect(called).to.deep.equal([1, 2])
  it "toString", ->
    expect(Bacon.never().doEnd((->)).toString()).to.equal("Bacon.never().doEnd(function)")
