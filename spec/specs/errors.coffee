# build-dependencies: eventstream

describe "EventStream.errors", ->
  describe "Includes errors only", ->
    expectStreamEvents(
      -> series(1, [1, error(), 2]).errors()
      [error()])
  it "toString", ->
    expect(Bacon.never().errors().toString()).to.equal("Bacon.never().errors()")

