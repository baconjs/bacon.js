# build-dependencies: filter
describe "Bacon.update", ->
  describe "works like Bacon.when, but produces a property, and can be defined in terms of a current value", ->
    expectPropertyEvents(
      ->
        [r,i,_] = ['r','i',0]
        incr  = series(1, [1, _, 1, _, 2, _, 1, _, _, _, 2, _, 1]).filter((x) -> x != _)
        reset = series(1, [_, r, _, _, _, r, _, r, _, r, _, _, _]).filter((x) -> x == r)
        Bacon.update(
          0,
          [reset], 0,
          [incr], (i,c) -> i+c)
      [0, 1, 0, 1, 3, 0, 1, 0, 0, 2, 3], semiunstable)

  describe "Correctly handles multiple arguments in parameter list, and synchronous sources", ->
    expectPropertyEvents(
      ->
        one = once(1)
        two = once(2)
        Bacon.update(
          0,
          [one, two],  (i, a, b) -> [i,a,b])
      [0, [0,1,2]], unstable)
  it "Rejects patterns with Properties only", -> expectError("At least one EventStream required", ->
    Bacon.update(0, [Bacon.constant()], ->))
  it "toString", ->
    expect(Bacon.update(0, [Bacon.never()], (->)).toString()).to.equal("Bacon.update(0,[Bacon.never()],function)")
