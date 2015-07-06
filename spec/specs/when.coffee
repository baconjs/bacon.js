# build-dependencies: property, filter, take, map, scan

describe "Bacon.when", ->
  describe "synchronizes on join patterns", ->
    expectStreamEvents(
      ->
        [a,b,_] = ['a','b','_']
        as = series(1, [a, _, a, a, _, a, _, _, a, a]).filter((x) -> x == a)
        bs = series(1, [_, b, _, _, b, _, b, b, _, _]).filter((x) -> x == b)
        Bacon.when(
          [as, bs], (a,b) ->  a + b,
          [as],     (a)   ->  a)
      ['a', 'ab', 'a', 'ab', 'ab', 'ab'], semiunstable)
  describe "consider the join patterns from top to bottom", ->
    expectStreamEvents(
      ->
        [a,b,_] = ['a','b','_']
        as = series(1, [a, _, a, a, _, a, _, _, a, a]).filter((x) -> x == a)
        bs = series(1, [_, b, _, _, b, _, b, b, _, _]).filter((x) -> x == b)
        Bacon.when(
          [as],     (a)   ->  a,
          [as, bs], (a,b) ->  a + b)
      ['a', 'a', 'a', 'a', 'a', 'a'])
  describe "handles any number of join patterns", ->
    expectStreamEvents(
      ->
        [a,b,c,_] = ['a','b','c','_']
        as = series(1, [a, _, a, _, a, _, a, _, _, _, a, a]).filter((x) -> x == a)
        bs = series(1, [_, b, _, _, _, b, _, b, _, b, _, _]).filter((x) -> x == b)
        cs = series(1, [_, _, _, c, _, _, _, _, c, _, _, _]).filter((x) -> x == c)
        Bacon.when(
          [as, bs, cs], (a,b,c) ->  a + b + c,
          [as, bs],     (a,b) ->  a + b,
          [as],         (a)   ->  a)
      ['a', 'ab', 'a', 'abc', 'abc', 'ab'], semiunstable)
  describe "does'nt synchronize on properties", ->
    expectStreamEvents(
      ->
        p = repeat(1, ["p"]).take(100).toProperty()
        s = series(3, ["1", "2", "3"])
        Bacon.when(
          [p,s], (p, s) -> p + s)
      ["p1", "p2", "p3"])
    expectStreamEvents(
      ->
        p = series(3, ["p"]).toProperty()
        s = series(1, ["1"])
        Bacon.when(
          [p,s], (p, s) -> p + s)
      [])
    expectStreamEvents(
      ->
        [a,b,c,_] = ['a','b','c','_']
        as = series(1, [a, _, a, _, a, _, a, _, _, _, a, _, a]).filter((x) -> x == a)
        bs = series(1, [_, b, _, _, _, b, _, b, _, b, _, _, _]).filter((x) -> x == b)
        cs = series(1, [_, _, _, c, _, _, _, _, c, _, _, c, _]).filter((x) -> x == c).map(1).scan 0, ((x,y) -> x + y)
        Bacon.when(
          [as, bs, cs], (a,b,c) ->  a + b + c,
          [as],         (a)   ->  a)
      ['a', 'ab0', 'a', 'ab1', 'ab2', 'ab3'], semiunstable)
  it "Rejects patterns with Properties only", -> expectError("At least one EventStream required", ->
    Bacon.when([Bacon.constant()], ->))
  describe "doesn't output before properties have values", ->
    expectStreamEvents(
      ->
        p = series(2, ["p"])
        s = series(1, ["s"])
        Bacon.when(
          [s, p], (s, p) -> s + p)
      ["sp"])
  describe "returns Bacon.never() on the empty list of patterns", ->
    expectStreamEvents(
      ->
        Bacon.when()
      [])
  describe "returns Bacon.never() when all patterns are zero-length", ->
    expectStreamEvents(
      ->
        Bacon.when([], ->)
      [])
  describe "works with empty patterns", ->
    expectStreamEvents(
      -> Bacon.when(
           [once(1)], (x) -> x,
           [], ->)
      [1])
  describe "works with empty patterns (2)", ->
    expectStreamEvents(
      -> Bacon.when(
           [], ->,
           [once(1)], (x) -> x)
      [1])
  describe "works with single stream", ->
    expectStreamEvents(
      -> Bacon.when([once(1)], (x) -> x)
      [1])
  describe "works with multiples of streams", ->
    expectStreamEvents(
      ->
        [h,o,c,_] = ['h','o','c','_']
        hs = series(1, [h, _, h, _, h, _, h, _, _, _, h, _, h]).filter((x) -> x == h)
        os = series(1, [_, o, _, _, _, o, _, o, _, o, _, _, _]).filter((x) -> x == o)
        cs = series(1, [_, _, _, c, _, _, _, _, c, _, _, c, _]).filter((x) -> x == c)
        Bacon.when(
          [hs, hs, os], (h1,h2,o) ->  [h1,h2,o],
          [cs, os],    (c,o) -> [c,o])
      [['h', 'h', 'o'], ['c', 'o'], ['h', 'h', 'o'], ['c', 'o']], semiunstable)
  describe "works with multiples of properties", ->
    expectStreamEvents(
      ->
        c = Bacon.constant("c")
        Bacon.when(
          [c, c, once(1)], (c1, c2, _) -> c1 + c2)
      ["cc"])
  describe "accepts constants instead of functions too", ->
    expectStreamEvents(
      -> Bacon.when(once(1), 2, once(2), 3)
      [2, 3])
  describe "works with synchronous sources", ->
    expectStreamEvents(
      ->
        xs = once "x"
        ys = once "y"
        Bacon.when(
          [xs, ys], add
        )
      ["xy"])
  describe "works with endless sources", ->
    expectStreamEvents(
      ->
        xs = repeatedly(1, ["x"])
        ys = once "y"
        Bacon.when(
          [xs, ys], add
        )
      ["xy"])
  it "toString", ->
    expect(Bacon.when([Bacon.never()], (->)).toString()).to.equal("Bacon.when([Bacon.never()],function)")
