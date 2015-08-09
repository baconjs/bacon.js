# build-dependencies: bus, flatmap, delay

describe "Property.combine", ->
  describe "combines latest values of two properties, with given combinator function, passing through errors", ->
    expectPropertyEvents(
      ->
        left = series(2, [1, error(), 2, 3]).toProperty()
        right = series(2, [4, error(), 5, 6]).delay(t(1)).toProperty()
        left.combine(right, add)
      [5, error(), error(), 6, 7, 8, 9])
  describe "also accepts a field name instead of combinator function", ->
    expectPropertyEvents(
      ->
        left = series(1, [[1]]).toProperty()
        right = series(2, [[2]]).toProperty()
        left.combine(right, ".concat")
      [[1, 2]])

  describe "combines with null values", ->
    expectPropertyEvents(
      ->
        left = series(1, [null]).toProperty()
        right = series(1, [null]).toProperty()
        left.combine(right, (l, r)-> [l, r])
      [[null, null]])

  it "unsubscribes when initial value callback returns Bacon.noMore", ->
    calls = 0
    bus = new Bacon.Bus()
    other = Bacon.constant(["rolfcopter"])
    bus.toProperty(["lollerskates"]).combine(other, ".concat").subscribe (e) ->
      if !e.isInitial()
        calls += 1
      Bacon.noMore

    bus.push(["fail whale"])
    expect(calls).to.equal 0
  describe "does not duplicate same error from two streams", ->
    expectPropertyEvents(
      ->
        src = series(1, ["same", error()])
        Bacon.combineAsArray(src, src)
      [["same", "same"], error()])
  it "toString", ->
    expect(Bacon.constant(1).combine(Bacon.constant(2), (->)).toString()).to.equal("Bacon.constant(1).combine(Bacon.constant(2),function)")
  describe "with random methods on Array.prototype", ->
    it "doesn't throw exceptions", ->
      try
        Array.prototype.foo = "bar"
        events = []
        once("a").combine(once("b"), (a,b) -> [a,b]).onValue (v) ->
          events.push(v)
        expect(events).to.deep.equal([["a", "b"]])
      finally
        delete Array.prototype.foo



describe "EventStream.combine", ->
  describe "converts stream to Property, then combines", ->
    expectPropertyEvents(
      ->
        left = series(2, [1, error(), 2, 3])
        right = series(2, [4, error(), 5, 6]).delay(t(1)).toProperty()
        left.combine(right, add)
      [5, error(), error(), 6, 7, 8, 9])

describe "Bacon.combineAsArray", ->
  describe "initial value", ->
    event = null
    before ->
      prop = Bacon.constant(1)
      Bacon.combineAsArray(prop).subscribe (x) ->
        event = x if x.hasValue()
    it "is output as Initial event", ->
      expect(event.isInitial()).to.equal(true)
  describe "combines properties and latest values of streams, into a Property having arrays as values", ->
    expectPropertyEvents(
      ->
        stream = series(1, ["a", "b"])
        Bacon.combineAsArray([Bacon.constant(1), Bacon.constant(2), stream])
      [[1, 2, "a"], [1, 2, "b"]])
  describe "Works with streams provided as a list of arguments as well as with a single array arg", ->
    expectPropertyEvents(
      ->
        stream = series(1, ["a", "b"])
        Bacon.combineAsArray(Bacon.constant(1), Bacon.constant(2), stream)
      [[1, 2, "a"], [1, 2, "b"]])
  describe "works with single property", ->
    expectPropertyEvents(
      ->
        Bacon.combineAsArray([Bacon.constant(1)])
      [[1]])
  describe "works with single stream", ->
    expectPropertyEvents(
      ->
        Bacon.combineAsArray([once(1)])
      [[1]])
  describe "works with arrays as values, with first array being empty (bug fix)", ->
    expectPropertyEvents(
      ->
        Bacon.combineAsArray([Bacon.constant([]), Bacon.constant([1])])
    ([[[], [1]]]))
  describe "works with arrays as values, with first array being non-empty (bug fix)", ->
    expectPropertyEvents(
      ->
        Bacon.combineAsArray([Bacon.constant([1]), Bacon.constant([2])])
    ([[[1], [2]]]))
  describe "works with empty array", ->
    expectPropertyEvents(
      -> Bacon.combineAsArray([])
      [[]])
  describe "works with empty args list", ->
    expectPropertyEvents(
      -> Bacon.combineAsArray()
      [[]])
  describe "accepts constant values instead of Observables", ->
    expectPropertyEvents(
      -> Bacon.combineAsArray(Bacon.constant(1), 2, 3)
    [[1,2,3]])
  describe "works with synchronous sources and flatMap (#407)", ->
    expectStreamEvents(
      -> 
          once(123)
          .flatMap ->
              Bacon.combineAsArray(once(1), once(2), 3)
    [[1,2,3]])
  it "preserves laziness", ->
    calls = 0
    incr = (x) ->
      calls++
      x
    skip(4, Bacon.combineAsArray(fromArray([1,2,3,4,5]).map(incr))).onValue()
    expect(calls).to.equal(1)
  it "toString", ->
    expect(Bacon.combineAsArray(Bacon.never()).toString()).to.equal("Bacon.combineAsArray(Bacon.never())")

describe "Bacon.combineWith", ->
  describe "combines n properties, streams and constants using an n-ary function", ->
    expectPropertyEvents(
      ->
        stream = series(1, [1, 2])
        f = (x, y, z) -> x + y + z
        Bacon.combineWith(f, stream, Bacon.constant(10), 100)
      [111, 112])
  describe "works with single input", ->
    expectPropertyEvents(
      ->
        stream = series(1, [1, 2])
        f = (x) -> x * 2
        Bacon.combineWith(f, stream)
      [2, 4])
  describe "works with 0 inputs (results to a constant)", ->
    expectPropertyEvents(
      ->
        Bacon.combineWith(-> 1)
      [1])
  describe "works with streams provided as an array as first arg", ->
    expectPropertyEvents(
      ->
        f = Math.max
        Bacon.combineWith(f, [Bacon.constant(0), Bacon.constant(1)])
      [1]
    )
  describe "works with streams provided as an array as second arg", ->
    expectPropertyEvents(
      ->
        f = Math.max
        Bacon.combineWith([Bacon.constant(0), Bacon.constant(1)], f)
      [1]
    )
  describe "works with streams provided as arguments and function as last argument", ->
    expectPropertyEvents(
      ->
        f = Math.max
        Bacon.combineWith(Bacon.constant(0), Bacon.constant(1), f)
      [1]
    )
  describe "works with empty array", ->
    expectPropertyEvents(
      -> Bacon.combineWith((-> 1), [])
      [1]
    )
  it "toString", ->
    expect(Bacon.combineWith((->), Bacon.never()).toString()).to.equal("Bacon.combineWith(function,Bacon.never())")

describe "Bacon.onValues", ->
  it "is a shorthand for combineAsArray.onValues", ->
    f = mockFunction()
    Bacon.onValues(1, 2, 3, f)
    f.verify(1,2,3)
