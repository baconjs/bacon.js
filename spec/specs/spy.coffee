# build-dependencies: combine

describe "Bacon.spy", ->
  testSpy = (expectedCount, f) ->
    calls = 0
    spy = (obs) -> 
      obs.toString()
      calls++
    Bacon.spy spy
    f()
    expect(calls).to.equal(expectedCount)
  describe "calls spy function for all created Observables", ->
    it "EventStream", ->
      testSpy 1, -> once(1)
    it "Property", ->
      testSpy 1, -> Bacon.constant(1)
    it "map", ->
      testSpy 2, -> once(1).map(->)
    it "combineTemplate (also called for the intermediate combineAsArray property)", ->
      testSpy 5, -> Bacon.combineTemplate([once(1), Bacon.constant(2)])
