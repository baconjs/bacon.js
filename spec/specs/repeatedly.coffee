require("../../src/repeatedly")
Bacon = require("../../src/core").default
expect = require("chai").expect
{ expectStreamEvents, take } = require("../SpecHelper")

describe "Bacon.repeatedly", ->
  describe "repeats given sequence forever", ->
    expectStreamEvents(
      -> take 5, Bacon.repeatedly(1, [1,2])
      [1,2,1,2,1])
  it "toString", ->
    expect(Bacon.repeatedly(1, [1]).toString()).to.equal("Bacon.repeatedly(1,[1])")
