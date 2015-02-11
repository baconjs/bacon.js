describe "EventStream.concat", ->
  describe "provides values from streams in given order and ends when both are exhausted", ->
    expectStreamEvents(
      ->
        left = series(2, [1, error(), 2, 3])
        right = series(1, [4, 5, 6])
        left.concat(right)
      [1, error(), 2, 3, 4, 5, 6], unstable)
  describe "respects subscriber return value when providing events from left stream", ->
    expectStreamEvents(
      ->
        left = repeat(3, [1, 3]).take(3)
        right = repeat(2, [1]).take(3)
        left.concat(right).takeWhile(lessThan(2))
      [1])
  describe "respects subscriber return value when providing events from right stream", ->
    expectStreamEvents(
      ->
        left = series(3, [1, 2])
        right = series(2, [2, 4, 6])
        left.concat(right).takeWhile(lessThan(4))
      [1, 2, 2])
  describe "works with Bacon.never()", ->
    expectStreamEvents(
      -> Bacon.never().concat(Bacon.never())
      [])
  describe "works with Bacon.once()", ->
    expectStreamEvents(
      -> Bacon.once(2).concat(Bacon.once(1))
      [2, 1])
  describe "works with Bacon.once() and Bacon.never()", ->
    expectStreamEvents(
      -> Bacon.once(1).concat(Bacon.never())
      [1])
  describe "works with Bacon.never() and Bacon.once()", ->
    expectStreamEvents(
      -> Bacon.never().concat(Bacon.once(1))
      [1])
  describe "works with Bacon.once() and async source", ->
    expectStreamEvents(
      -> Bacon.once(1).concat(series(1, [2, 3]))
      [1, 2, 3])
  describe "works with Bacon.once() and fromArray()", ->
    expectStreamEvents(
      -> Bacon.once(1).concat(fromArray([2, 3]))
      [1, 2, 3], unstable)
  describe "Works with synchronized left stream and doAction", ->
    expectStreamEvents(
      ->
        bus = new Bacon.Bus()
        stream = fromArray([1,2]).flatMapLatest (x) ->
          Bacon.once(x).concat(later(10, x).doAction((x) -> bus.push(x); bus.end()))
        stream.onValue ->
        bus
      [2])
  it "toString", ->
    expect(Bacon.once(1).concat(Bacon.once(2)).toString()).to.equal("Bacon.once(1).concat(Bacon.once(2))")

describe "EventStream.startWith", ->
  describe "provides seed value, then the rest", ->
    expectStreamEvents(
      ->
        left = series(1, [1, 2, 3])
        left.startWith('pow')
      ['pow', 1, 2, 3], unstable)
  describe "works with synchronous source", ->
    expectStreamEvents(
      ->
        left = fromArray([1, 2, 3])
        left.startWith('pow')
      ['pow', 1, 2, 3], unstable)
  it "toString", ->
    expect(Bacon.never().startWith(0).toString()).to.equal("Bacon.never().startWith(0)")

describe "Property.startWith", ->
  describe "starts with given value if the Property doesn't have an initial value", ->
    expectPropertyEvents(
      ->
        left = series(1, [1, 2, 3]).toProperty()
        left.startWith('pow')
      ['pow', 1, 2, 3], unstable)
  describe "works with synchronous source", ->
    expectPropertyEvents(
      ->
        left = fromArray([1, 2, 3]).toProperty()
        left.startWith('pow')
      ['pow', 1, 2, 3], unstable)
  describe "starts with the initial value of the Property if any", ->
    expectPropertyEvents(
      ->
        left = series(1, [1, 2, 3]).toProperty(0)
        left.startWith('pow')
      [0, 1, 2, 3], unstable)
  it "works with combineAsArray", ->
    result = null
    a = Bacon.constant("lolbal")
    result = Bacon.combineAsArray([a.map(true), a.map(true)]).map("right").startWith("wrong")
    result.onValue((x) -> result = x)
    expect(result).to.equal("right")
  it "toString", ->
    expect(Bacon.constant(2).startWith(1).toString()).to.equal("Bacon.constant(2).startWith(1)")

describe "EventStream.toProperty", ->
  describe "delivers current value and changes to subscribers", ->
    expectPropertyEvents(
      ->
        s = new Bacon.Bus()
        p = s.toProperty("a")
        soon ->
          s.push "b"
          s.end()
        p
      ["a", "b"])
  describe "passes through also Errors", ->
    expectPropertyEvents(
      -> series(1, [1, error(), 2]).toProperty()
      [1, error(), 2])

  describe "supports null as value", ->
    expectPropertyEvents(
      -> series(1, [null, 1, null]).toProperty(null)
      [null, null, 1, null])

  describe "does not get messed-up by a transient subscriber (bug fix)", ->
    expectPropertyEvents(
      ->
        prop = series(1, [1,2,3]).toProperty(0)
        prop.subscribe (event) =>
          Bacon.noMore
        prop
      [0, 1, 2, 3])
  describe "works with synchronous source", ->
    expectPropertyEvents(
      -> fromArray([1,2,3]).toProperty()
      [1,2,3])
    expectPropertyEvents(
      -> fromArray([1,2,3]).toProperty(0)
      [0,1,2,3], unstable)
  it "preserves laziness", ->
    calls = 0
    id = (x) ->
      calls++
      x
    fromArray([1,2,3,4,5]).map(id).toProperty().skip(4).onValue()
    expect(calls).to.equal(1)
  it "toString", ->
    expect(Bacon.once(1).toProperty(0).toString()).to.equal("Bacon.once(1).toProperty(0)")

describe "Property.toEventStream", ->
  describe "creates a stream that starts with current property value", ->
    expectStreamEvents(
      -> series(1, [1, 2]).toProperty(0).toEventStream()
      [0, 1, 2], unstable)
  describe "works with synchronous source", ->
    expectStreamEvents(
      -> fromArray([1, 2]).toProperty(0).toEventStream()
      [0, 1, 2], unstable)

describe "Property.toProperty", ->
  describe "returns the same Property", ->
    expectPropertyEvents(
      -> Bacon.constant(1).toProperty()
      [1])
  it "rejects arguments", ->
    try
      Bacon.constant(1).toProperty(0)
      fail()
    catch e

describe "Property.takeUntil", ->
  describe "takes elements from source until an event appears in the other stream", ->
    expectPropertyEvents(
      -> series(2, [1,2,3]).toProperty().takeUntil(later(t(3)))
      [1])
  describe "works with errors", ->
    expectPropertyEvents(
      ->
        src = repeat(2, [1, error(), 3])
        stopper = repeat(5, ["stop!"])
        src.toProperty(0).takeUntil(stopper)
      [0, 1, error()])
  it "works with synchronous error (fix #447)", ->
    errors = []
    Bacon.once(new Bacon.Error("fail")).toProperty()
      .takeUntil(Bacon.never())
      .onError((e) -> errors.push(e))
    expect(errors).to.deep.equal(["fail"])
  it "toString", ->
    expect(Bacon.constant(1).takeUntil(Bacon.never()).toString()).to.equal("Bacon.constant(1).takeUntil(Bacon.never())")

describe "Property.delay", ->
  describe "delivers initial value and changes", ->
    expectPropertyEvents(
      -> series(1, [1,2,3]).toProperty(0).delay(t(1))
      [0,1,2,3])
  describe "delays changes", ->
    expectStreamEvents(
      ->
        series(2, [1,2,3])
          .toProperty()
          .delay(t(2)).changes().takeUntil(later(t(5)))
      [1], unstable)
  describe "does not delay initial value", ->
    expectPropertyEvents(
      -> series(3, [1]).toProperty(0).delay(1).takeUntil(later(t(2)))
      [0])
  it "toString", ->
    expect(Bacon.constant(0).delay(1).toString()).to.equal("Bacon.constant(0).delay(1)")

describe "Property.endOnError", ->
  describe "terminates on Error", ->
    expectPropertyEvents(
      -> series(2, [1, error(), 2]).toProperty().endOnError()
      [1, error()])

describe "Property.changes", ->
  describe "sends property change events", ->
    expectStreamEvents(
      ->
        s = new Bacon.Bus()
        p = s.toProperty("a").changes()
        soon ->
          s.push "b"
          s.error()
          s.end()
        p
      ["b", error()])
  describe "works with synchronous source", ->
    expectStreamEvents(
      -> fromArray([1, 2, 3]).toProperty(0).changes()
      [1, 2, 3])

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
        Bacon.once("a").combine(Bacon.once("b"), (a,b) -> [a,b]).onValue (v) ->
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

describe "Bacon.groupSimultaneous", ->
  describe "groups simultaneous values in to arrays", ->
    expectStreamEvents(
      -> 
        src = series(1, [1,2])
        stream = src.merge(src.map((x) -> x * 2))
        Bacon.groupSimultaneous(stream)
      [[[1, 2]], [[2,4]]])
  describe "groups simultaneous values from multiple sources in to arrays", ->
    expectStreamEvents(
      -> 
        src = series(1, [1,2])
        stream = src.merge(src.map((x) -> x * 2))
        stream2 = src.map (x) -> x * 4
        Bacon.groupSimultaneous(stream, stream2)
      [[[1, 2], [4]], [[2,4], [8]]])
  describe "accepts an array or multiple args", ->
    expectStreamEvents(
      -> Bacon.groupSimultaneous([later(1, 1), later(2, 2)])
      [[[1],[]], [[], [2]]])
  describe "returns empty stream for zero sources", ->
    expectStreamEvents(
      -> Bacon.groupSimultaneous()
      [])
    expectStreamEvents(
      -> Bacon.groupSimultaneous([])
      [])
  describe "works with synchronous sources", ->
      expectStreamEvents(
        -> Bacon.groupSimultaneous(fromArray([1,2]))
        [[[1]], [[2]]])
      expectStreamEvents(
        -> Bacon.groupSimultaneous(fromArray([1,2]).mapEnd(3))
        [[[1]], [[2]], [[3]]])
  it "toString", ->
    expect(Bacon.groupSimultaneous(Bacon.never()).toString()).to.equal("Bacon.groupSimultaneous(Bacon.never())")

describe "Property update is atomic", ->
  describe "in a diamond-shaped combine() network", ->
    expectPropertyEvents(
      ->
         a = series(1, [1, 2]).toProperty()
         b = a.map (x) -> x
         c = a.map (x) -> x
         b.combine(c, (x, y) -> x + y)
      [2, 4])
  describe "in a triangle-shaped combine() network", ->
    expectPropertyEvents(
      ->
         a = series(1, [1, 2]).toProperty()
         b = a.map (x) -> x
         a.combine(b, (x, y) -> x + y)
      [2, 4])
  describe "when filter is involved", ->
    expectPropertyEvents(
      ->
         a = series(1, [1, 2]).toProperty()
         b = a.map((x) -> x).filter(true)
         a.combine(b, (x, y) -> x + y)
      [2, 4])
  describe "when root property is based on combine*", ->
    expectPropertyEvents(
      ->
         a = series(1, [1, 2]).toProperty().combine(Bacon.constant(0), (x, y) -> x)
         b = a.map (x) -> x
         c = a.map (x) -> x
         b.combine(c, (x, y) -> x + y)
      [2, 4])
  describe "when root is not a Property", ->
    expectPropertyEvents(
      ->
         a = series(1, [1, 2])
         b = a.map (x) -> x
         c = a.map (x) -> x
         b.combine(c, (x, y) -> x + y)
      [2, 4])
  it "calls combinator function for valid combos only", ->
    calls = 0
    results = []
    combinator = (x,y) ->
      calls++
      x+y
    src = new Bacon.Bus()
    prop = src.toProperty()
    out = prop.map((x) -> x)
      .combine(prop.map((x) -> x * 2), combinator)
      .doAction(->)
      .combine(prop, (x,y) -> x)
    out.onValue((x) -> results.push(x))
    src.push(1)
    src.push(2)
    expect(results).to.deep.equal([3,6])
    expect(calls).to.equal(2)
  describe "yet respects subscriber return values (bug fix)", ->
    expectStreamEvents(
      -> repeatedly(t(1), [1, 2, 3]).toProperty().changes().take(1)
      [1])

describe "When an Event triggers another one in the same stream, while dispatching", ->
  it "Delivers triggered events correctly", ->
    bus = new Bacon.Bus
    values = []
    bus.take(2).onValue (v) ->
      bus.push "A"
      bus.push "B"
    bus.onValue (v) ->
      values.push(v)
    bus.push "a"
    bus.push "b"
    expect(values).to.deep.equal(["a", "A", "A", "B", "B", "b"])
  it "EventStream.take(1) works correctly (bug fix)", ->
    bus = new Bacon.Bus
    values = []
    bus.take(1).onValue (v) ->
      bus.push("onValue triggers a side-effect here")
      values.push(v)
    bus.push("foo")
    expect(values).to.deep.equal(["foo"])
  it "complex scenario (fix #470)", ->
    values = []
    bus1 = new Bacon.Bus()
    bus2 = new Bacon.Bus()
    p1 = bus1.toProperty("p1")
    p2 = bus2.toProperty(true)
    p2.filter(Bacon._.id).changes().onValue -> bus1.push "empty"
    Bacon.combineAsArray(p1, p2).onValue (val) -> values.push val

    bus2.push false
    bus2.push true
    expect(values).to.deep.equal([
      ["p1", true],
      ["p1", false],
      ["p1", true],
      ["empty", true]])

describe "observables created while dispatching", ->
  verifyWhileDispatching = (name, f, expected) ->
    it name + " (independent)", ->
      values = []
      Bacon.once(1).onValue ->
        f().onValue (value) ->
          values.push(value)
        expect(values).to.deep.equal(expected)
      expect(values).to.deep.equal(expected)

    it name + " (dependent)", ->
      values = []
      src = Bacon.combineAsArray(Bacon.once(1).toProperty(), Bacon.constant(2))
      src.onValue ->
        src.flatMap(f()).onValue (value) ->
          values.push(value)
        expect(values).to.deep.equal(expected)
      expect(values).to.deep.equal(expected)

  verifyWhileDispatching "with combineAsArray", 
    (-> Bacon.combineAsArray([Bacon.constant(1)])),
    [[1]]
  verifyWhileDispatching "with combineAsArray.startWith", 
      (->
        a = Bacon.constant("lolbal")
        Bacon.combineAsArray([a, a]).map("right").startWith("wrong")), 
      ["right"]
  verifyWhileDispatching "with stream.startWith", 
    (-> later(1).startWith(0)), 
    [0]
  verifyWhileDispatching "with combineAsArray.changes.startWith", 
    (->
      a = Bacon.constant("lolbal")
      Bacon.combineAsArray([a, a]).changes().startWith("right")), 
    ["right"]
  verifyWhileDispatching "with flatMap", (->
      a = Bacon.constant("lolbal")
      a.flatMap((x) -> Bacon.once(x))), ["lolbal"]
  verifyWhileDispatching "with awaiting", (->
      a = Bacon.constant(1)
      s = a.awaiting(a.map(->))), [true]
  verifyWhileDispatching "with concat", (->
      s = Bacon.once(1).concat(Bacon.once(2))), [1,2]
  verifyWhileDispatching "with Property.delay", (->
      c = Bacon.constant(1)
      Bacon.combineAsArray([c, c]).delay(1).map(".0")), [1]

describe "when subscribing while dispatching", ->
  describe "single subscriber", ->
    describe "up-to-date values are used (skipped bounce)", ->
      expectStreamEvents(
        ->
          src = series(1, [1,2])
          trigger = src.map((x) -> x)
          trigger.onValue ->
          value = src.toProperty()
          value.onValue ->
          trigger.flatMap ->
            value.take(1)
        [1,2])
    describe "delayed bounce", ->
      expectStreamEvents(
        ->
          src = series(1, [1,2])
          trigger = src.map((x) -> x)
          trigger.onValue ->
          value = src.filter((x) -> x == 1).toProperty(0)
          value.onValue ->
          trigger.flatMap ->
            value.take(1)
        [0, 1])
  describe "multiple subscribers", ->
    describe "up-to-date values are used (skipped bounce)", ->
      expectStreamEvents(
        ->
          src = series(1, [1,2])
          trigger = src.map((x) -> x)
          trigger.onValue ->
          value = src.toProperty()
          value.onValue ->
          trigger.flatMap ->
            value.onValue(->)
            value.take(1)
        [1,2])
    describe "delayed bounce", ->
      expectStreamEvents(
        ->
          src = series(1, [1,2])
          trigger = src.map((x) -> x)
          trigger.onValue ->
          value = src.filter((x) -> x == 1).toProperty(0)
          value.onValue ->
          trigger.flatMap ->
            value.onValue(->)
            value.take(1)
        [0, 1])
  describe "delayed bounce in case Property ended (bug fix)", ->
    expectStreamEvents(
      -> 
        bus = new Bacon.Bus()
        root = Bacon.once(0).toProperty()
        root.onValue ->
        later(1).onValue ->
          root.map(-> 1).subscribe (event) ->
            if event.isEnd()
              bus.end()
            else
              bus.push(event.value())
        bus
      [1])
  describe "poking for errors 2", ->
    expectStreamEvents(
      ->
        bus = new Bacon.Bus()
        root = sequentially(1, [1,2]).toProperty()
        root.subscribe (event) ->
        outdatedChild = root.filter((x) -> x == 1).map((x) -> x)
        outdatedChild.onValue(->) # sets value but will be outdated at value 2

        later(3).onValue ->
          outdatedChild.subscribe (event) ->
            if event.isEnd()
              bus.end()
            else
              bus.push(event.value())
        bus
      [1]
    )

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
        Bacon.combineAsArray([Bacon.once(1)])
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
        Bacon
          .once(123)
          .flatMap ->
              Bacon.combineAsArray(Bacon.once(1), Bacon.once(2), 3)
    [[1,2,3]])
  it "preserves laziness", ->
    calls = 0
    id = (x) ->
      calls++
      x
    Bacon.combineAsArray(fromArray([1,2,3,4,5]).map(id)).skip(4).onValue()
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
  it "toString", ->
    expect(Bacon.combineWith((->), Bacon.never()).toString()).to.equal("Bacon.combineWith(function,Bacon.never())")

describe "Bacon.mergeAll", ->
  describe ("merges all given streams"), ->
    expectStreamEvents(
      ->
        Bacon.mergeAll([
          series(3, [1, 2])
          series(3, [3, 4]).delay(t(1))
          series(3, [5, 6]).delay(t(2))])
      [1, 3, 5, 2, 4, 6], unstable)
  describe ("supports n-ary syntax"), ->
    expectStreamEvents(
      ->
        Bacon.mergeAll(
          series(3, [1, 2])
          series(3, [3, 4]).delay(t(1))
          series(3, [5, 6]).delay(t(2)))
      [1, 3, 5, 2, 4, 6], unstable)
  describe "works with a single stream", ->
    expectStreamEvents(
      -> Bacon.mergeAll([Bacon.once(1)])
      [1])
    expectStreamEvents(
      -> Bacon.mergeAll(Bacon.once(1))
      [1])
  describe "returns empty stream for zero input", ->
    expectStreamEvents(
      -> Bacon.mergeAll([])
      [])
    expectStreamEvents(
      -> Bacon.mergeAll()
      [])
  it "toString", ->
    expect(Bacon.mergeAll(Bacon.never()).toString()).to.equal("Bacon.mergeAll(Bacon.never())")

describe "Property.sampledBy(stream)", ->
  describe "samples property at events, resulting to EventStream", ->
    expectStreamEvents(
      ->
        prop = series(2, [1, 2]).toProperty()
        stream = repeat(3, ["troll"]).take(4)
        prop.sampledBy(stream)
      [1, 2, 2, 2])
  describe "includes errors from both Property and EventStream", ->
    expectStreamEvents(
      ->
        prop = series(2, [error(), 2]).toProperty()
        stream = series(3, [error(), "troll"])
        prop.sampledBy(stream)
      [error(), error(), 2])
  describe "ends when sampling stream ends", ->
    expectStreamEvents(
      ->
        prop = repeat(2, [1, 2]).toProperty()
        stream = repeat(2, [""]).delay(t(1)).take(4)
        prop.sampledBy(stream)
      [1, 2, 1, 2])
  describe "accepts optional combinator function f(Vp, Vs)", ->
    expectStreamEvents(
      ->
        prop = series(2, ["a", "b"]).toProperty()
        stream = series(2, ["1", "2", "1", "2"]).delay(t(1))
        prop.sampledBy(stream, add)
      ["a1", "b2", "b1", "b2"])
  describe "allows method name instead of function too", ->
    expectStreamEvents(
      ->
        Bacon.constant([1]).sampledBy(Bacon.once([2]), ".concat")
      [[1, 2]])
  describe "works with same origin", ->
    expectStreamEvents(
      ->
        src = series(2, [1, 2])
        src.toProperty().sampledBy(src)
      [1, 2])
    expectStreamEvents(
      ->
        src = series(2, [1, 2])
        src.toProperty().sampledBy(src.map(times, 2))
      [1, 2])
  describe "uses updated property after combine", ->
    latter = (a, b) -> b
    expectPropertyEvents(
      ->
        src = series(2, ["b", "c"]).toProperty("a")
        combined = Bacon.constant().combine(src, latter)
        src.sampledBy(combined, add)
      ["aa", "bb", "cc"])
  describe "uses updated property after combine with subscriber", ->
    latter = (a, b) -> b
    expectPropertyEvents(
      ->
        src = series(2, ["b", "c"]).toProperty("a")
        combined = Bacon.constant().combine(src, latter)
        combined.onValue(->)
        src.sampledBy(combined, add)
      ["aa", "bb", "cc"])
  describe "skips samplings that occur before the property gets its first value", ->
    expectStreamEvents(
      ->
        p = series(5, [1]).toProperty()
        p.sampledBy(series(3, [0]))
      [])
    expectStreamEvents(
      ->
        p = series(5, [1, 2]).toProperty()
        p.sampledBy(series(3, [0, 0, 0, 0]))
      [1, 1, 2], unstable)
    expectPropertyEvents(
      ->
        p = series(5, [1, 2]).toProperty()
        p.sampledBy(series(3, [0, 0, 0, 0]).toProperty())
      [1, 1, 2], unstable)
  describe "works with stream of functions", ->
    f = ->
    expectStreamEvents(
      ->
        p = series(1, [f]).toProperty()
        p.sampledBy(series(1, [1, 2, 3]))
      [f, f, f])
  describe "works with synchronous sampler stream", ->
    expectStreamEvents(
      -> Bacon.constant(1).sampledBy(fromArray([1,2,3]))
      [1,1,1], unstable)
    expectStreamEvents(
      -> later(1, 1).toProperty().sampledBy(fromArray([1,2,3]))
      [])
  describe "laziness", ->
    calls = 0
    before (done) ->
      id = (x) ->
        calls++
        x
      sampler = later(5).map(id)
      property = repeat(1, [1]).toProperty().map(id)
      sampled = property.sampledBy sampler
      sampled.onValue()
      sampled.onEnd(done)
    it "preserves laziness", ->
      expect(calls).to.equal(1)
  it "toString", ->
    expect(Bacon.constant(0).sampledBy(Bacon.never()).toString()).to.equal("Bacon.constant(0).sampledBy(Bacon.never(),function)")
  describe "With circular Bus setup", ->
    it "Just works (bug fix)", ->
      values = []
      clicks = new Bacon.Bus()
      toggleBus = new Bacon.Bus()

      shown = toggleBus.toProperty(false)
      shown.changes().onValue (show) => values.push show
      toggleClicks = shown.sampledBy(clicks).map (shown) => not shown

      toggleBus.plug(toggleClicks)

      clicks.push(true)
      expect(values).to.deep.equal([true])

describe "Property.sampledBy(property)", ->
  describe "samples property at events, resulting to a Property", ->
    expectPropertyEvents(
      ->
        prop = series(2, [1, 2]).toProperty()
        sampler = repeat(3, ["troll"]).take(4).toProperty()
        prop.sampledBy(sampler)
      [1, 2, 2, 2])
  describe "works on an event stream by automatically converting to property", ->
    expectPropertyEvents(
      ->
        stream = series(2, [1, 2])
        sampler = repeat(3, ["troll"]).take(4).toProperty()
        stream.sampledBy(sampler)
      [1, 2, 2, 2])
  describe "accepts optional combinator function f(Vp, Vs)", ->
    expectPropertyEvents(
      ->
        prop = series(2, ["a", "b"]).toProperty()
        sampler = series(2, ["1", "2", "1", "2"]).delay(t(1)).toProperty()
        prop.sampledBy(sampler, add)
      ["a1", "b2", "b1", "b2"])

describe "Property.sample", ->
  describe "samples property by given interval", ->
    expectStreamEvents(
      ->
        prop = series(2, [1, 2]).toProperty()
        prop.sample(t(3)).take(4)
      [1, 2, 2, 2])
  describe "includes all errors", ->
    expectStreamEvents(
      ->
        prop = series(2, [1, error(), 2]).toProperty()
        prop.sample(t(5)).take(2)
      [error(), 1, 2], unstable)
  describe "works with synchronous source", ->
    expectStreamEvents(
      ->
        prop = Bacon.constant(1)
        prop.sample(t(3)).take(4)
      [1, 1, 1, 1])
  it "toString", ->
    expect(Bacon.constant(0).sample(1).toString()).to.equal("Bacon.constant(0).sample(1)")

describe "EventStream.errors", ->
  describe "Includes errors only", ->
    expectStreamEvents(
      -> series(1, [1, error(), 2]).errors()
      [error()])
  it "toString", ->
    expect(Bacon.never().errors().toString()).to.equal("Bacon.never().errors()")

describe "EventStream.scan", ->
  describe "accumulates values with given seed and accumulator function, passing through errors", ->
    expectPropertyEvents(
      -> series(1, [1, 2, error(), 3]).scan(0, add)
      [0, 1, 3, error(), 6])
  describe "also works with method name", ->
    expectPropertyEvents(
      -> series(1, [[1], [2]]).scan([], ".concat")
      [[], [1], [1, 2]])
  it "yields the seed value immediately", ->
    outputs = []
    bus = new Bacon.Bus()
    bus.scan(0, -> 1).onValue((value) -> outputs.push(value))
    expect(outputs).to.deep.equal([0])
  describe "yields null seed value", ->
    expectPropertyEvents(
      -> series(1, [1]).scan(null, ->1)
      [null, 1])
  describe "works with synchronous streams", ->
    expectPropertyEvents(
      -> fromArray([1,2,3]).scan(0, ((x,y)->x+y))
      [0,1,3,6], unstable)
  describe "calls accumulator function once per value", ->
    describe "(simple case)", ->
      count = 0
      expectPropertyEvents(
        -> series(2, [1,2,3]).scan(0, (x,y) -> count++; x + y)
        [0, 1, 3, 6]
        { extraCheck: -> it "calls accumulator once per value", -> expect(count).to.equal(3)}
      )
    it "(when pushing to Bus in accumulator)", ->
      count = 0
      someBus = new Bacon.Bus()
      someBus.onValue ->
      src = new Bacon.Bus()
      result = src.scan 0, ->
        someBus.push()
        count++
      result.onValue ->
      result.onValue ->
      src.push()
      expect(count).to.equal(1)


describe "EventStream.fold", ->
  describe "folds stream into a single-valued Property, passes through errors", ->
    expectPropertyEvents(
      -> series(1, [1, 2, error(), 3]).fold(0, add)
      [error(), 6])
  describe "has reduce as synonym", ->
    expectPropertyEvents(
      -> series(1, [1, 2, error(), 3]).fold(0, add)
      [error(), 6])
  describe "works with synchronous source", ->
    expectPropertyEvents(
      -> fromArray([1, 2, error(), 3]).fold(0, add)
      [error(), 6])
  describe.skip "works with really large chunks too, with { eager: true }", ->
    count = 50000
    expectPropertyEvents(
      -> series(1, [1..count]).fold(0, ((x,y) -> x+1), { eager: true })
      [count])

describe "Property.scan", ->
  describe "with Init value, starts with f(seed, init)", ->
    expectPropertyEvents(
      -> series(1, [2,3]).toProperty(1).scan(0, add)
      [1, 3, 6])
  describe "without Init value, starts with seed", ->
    expectPropertyEvents(
      -> series(1, [2,3]).toProperty().scan(0, add)
      [0, 2, 5])
  describe "treats null seed value like any other value", ->
    expectPropertyEvents(
      -> series(1, [1]).toProperty().scan(null, add)
      [null, 1])
    expectPropertyEvents(
      -> series(1, [2]).toProperty(1).scan(null, add)
      [1, 3])
  describe "for synchronous source", ->
    describe "with Init value, starts with f(seed, init)", ->
      expectPropertyEvents(
        -> fromArray([2,3]).toProperty(1).scan(0, add)
        [1, 3, 6], unstable)
    describe "without Init value, starts with seed", ->
      expectPropertyEvents(
        -> fromArray([2,3]).toProperty().scan(0, add)
        [0, 2, 5], unstable)
    describe "works with synchronously responding empty source", ->
      expectPropertyEvents(
        -> Bacon.never().toProperty(1).scan(0, add)
        [1])

describe "EventStream.withStateMachine", ->
  f = (sum, event) ->
    if event.hasValue()
      [sum + event.value(), []]
    else if event.isEnd()
      [sum, [new Bacon.Next(-> sum), event]]
    else
      [sum, [event]]
  describe "runs state machine on the stream", ->
    expectStreamEvents(
      -> fromArray([1,2,3]).withStateMachine(0, f)
      [6])

describe "Property.withStateMachine", ->
  describe "runs state machine on the stream", ->
    expectPropertyEvents(
      -> fromArray([1,2,3]).toProperty().withStateMachine(0, (sum, event) ->
        if event.hasValue()
          [sum + event.value(), []]
        else if event.isEnd()
          [sum, [new Bacon.Next(-> sum), event]]
        else
          [sum, [event]])
      [6])

describe "Property.fold", ->
  describe "Folds Property into a single-valued one", ->
    expectPropertyEvents(
      -> series(1, [2,3]).toProperty(1).fold(0, add)
      [6])

describe "EventStream.diff", ->
  describe "apply diff function to previous and current values, passing through errors", ->
    expectPropertyEvents(
      -> series(1, [1, 2, error(), 3]).diff(0, add)
      [1, 3, error(), 5])
  describe "also works with method name", ->
    expectPropertyEvents(
      -> series(1, [[1], [2]]).diff([0], ".concat")
      [[0, 1], [1, 2]])
  it "does not yields the start value immediately", ->
    outputs = []
    bus = new Bacon.Bus()
    bus.diff(0, -> 1).onValue((value) -> outputs.push(value))
    expect(outputs).to.deep.equal([])
  it "toString", ->
    expect(Bacon.once(1).diff(0, (->)).toString()).to.equal("Bacon.once(1).diff(0,function)")

describe "Property.diff", ->
  describe "with Init value, starts with f(start, init)", ->
    expectPropertyEvents(
      -> series(1, [2,3]).toProperty(1).diff(0, add)
      [1, 3, 5])
  describe "without Init value, waits for the first value", ->
    expectPropertyEvents(
      -> series(1, [2,3]).toProperty().diff(0, add)
      [2, 5])
  describe "treats null start value like any other value", ->
    expectPropertyEvents(
      -> series(1, [1]).toProperty().diff(null, add)
      [1])
    expectPropertyEvents(
      -> series(1, [2]).toProperty(1).diff(null, add)
      [1, 3])

describe "EventStream.zip", ->
  describe "pairwise combines values from two streams", ->
    expectStreamEvents(
      -> series(1, [1, 2, 3]).zip(series(1, ['a', 'b', 'c']))
      [[1, 'a'], [2, 'b'], [3, 'c']])
  describe "passes through errors", ->
    expectStreamEvents(
      -> series(2, [1, error(), 2]).zip(series(2, ['a', 'b']).delay(1))
      [[1, 'a'], error(), [2, 'b']])
  describe "completes as soon as possible", ->
    expectStreamEvents(
      -> series(1, [1]).zip(series(1, ['a', 'b', 'c']))
      [[1, 'a']])
  describe "can zip an observable with itself", ->
    expectStreamEvents(
      ->
        obs = series(1, ['a', 'b', 'c'])
        obs.zip(obs.skip(1))
      [['a', 'b'], ['b', 'c']])
  it "toString", ->
    expect(Bacon.never().zip(Bacon.once(1)).toString()).to.equal("Bacon.never().zip(Bacon.once(1))")

describe "Property.zip", ->
  describe "pairwise combines values from two properties", ->
    expectStreamEvents(
      -> series(1, [1, 2, 3]).toProperty().zip(series(1, ['a', 'b', 'c']).toProperty())
      [[1, 'a'], [2, 'b'], [3, 'c']], { unstable })

describe "Bacon.zipAsArray", ->
  describe "zips an array of streams into a stream of arrays", ->
    expectStreamEvents(
      ->
        obs = series(1, [1, 2, 3, 4])
        Bacon.zipAsArray([obs, obs.skip(1), obs.skip(2)])
    [[1 , 2 , 3], [2 , 3 , 4]])
  describe "supports n-ary syntax", ->
    expectStreamEvents(
      ->
        obs = series(1, [1, 2, 3, 4])
        Bacon.zipAsArray(obs, obs.skip(1))
    [[1 , 2], [2 , 3], [3, 4]])
  describe "accepts Properties as well as EventStreams", ->
    expectStreamEvents(
      ->
        obs = series(1, [1, 2, 3, 4])
        Bacon.zipAsArray(obs, obs.skip(1), Bacon.constant(5))
    [[1 , 2, 5]])
  describe "works with single stream", ->
    expectStreamEvents(
      ->
        obs = series(1, [1, 2])
        Bacon.zipAsArray([obs])
    [[1], [2]])
    expectStreamEvents(
      ->
        obs = series(1, [1, 2])
        Bacon.zipAsArray(obs)
    [[1], [2]])
  describe "works with 0 streams (=Bacon.never())", ->
    expectStreamEvents(
      -> Bacon.zipAsArray([])
      [])
    expectStreamEvents(
      -> Bacon.zipAsArray()
      [])
  it "toString", ->
    expect(Bacon.zipAsArray(Bacon.never(), Bacon.never()).toString()).to.equal("Bacon.zipAsArray(Bacon.never(),Bacon.never())")

describe "Bacon.zipWith", ->
  describe "zips an array of streams with given function", ->
    expectStreamEvents(
      ->
        obs = series(1, [1, 2, 3, 4])
        Bacon.zipWith([obs, obs.skip(1), obs.skip(2)], ((x,y,z) -> (x + y + z)))
    [1 + 2 + 3, 2 + 3 + 4])
  describe "supports n-ary syntax", ->
    expectStreamEvents(
      ->
        obs = series(1, [1, 2, 3, 4])
        f = ((x,y,z) -> (x + y + z))
        Bacon.zipWith(f, obs, obs.skip(1), obs.skip(2))
    [1 + 2 + 3, 2 + 3 + 4])
  describe "works with single stream", ->
    expectStreamEvents(
      ->
        obs = series(1, [1,2])
        f = (x) -> x * 2
        Bacon.zipWith(f, obs)
      [1 * 2, 2 * 2])
  describe "works with 0 streams (=Bacon.never())", ->
    expectStreamEvents(
      ->
        Bacon.zipWith([], ->)
      [])
    expectStreamEvents(
      ->
        Bacon.zipWith(->)
      [])
  it "toString", ->
    expect(Bacon.zipWith((->), Bacon.never()).toString()).to.equal("Bacon.zipWith(function,Bacon.never())")

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
      ['a', 'ab', 'a', 'ab', 'ab', 'ab'], unstable)
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
      ['a', 'ab', 'a', 'abc', 'abc', 'ab'], unstable)
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
      ['a', 'ab0', 'a', 'ab1', 'ab2', 'ab3'], unstable)
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
           [Bacon.once(1)], (x) -> x,
           [], ->)
      [1])
  describe "works with empty patterns (2)", ->
    expectStreamEvents(
      -> Bacon.when(
           [], ->,
           [Bacon.once(1)], (x) -> x)
      [1])
  describe "works with single stream", ->
    expectStreamEvents(
      -> Bacon.when([Bacon.once(1)], (x) -> x)
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
      [['h', 'h', 'o'], ['c', 'o'], ['h', 'h', 'o'], ['c', 'o']], unstable)
  describe "works with multiples of properties", ->
    expectStreamEvents(
      ->
        c = Bacon.constant("c")
        Bacon.when(
          [c, c, Bacon.once(1)], (c1, c2, _) -> c1 + c2)
      ["cc"])
  describe "accepts constants instead of functions too", ->
    expectStreamEvents(
      -> Bacon.when(Bacon.once(1), 2, Bacon.once(2), 3)
      [2, 3])
  describe "works with synchronous sources", ->
    expectStreamEvents(
      ->
        xs = Bacon.once "x"
        ys = Bacon.once "y"
        Bacon.when(
          [xs, ys], (x, y) -> x + y
        )
      ["xy"])
  it "toString", ->
    expect(Bacon.when([Bacon.never()], (->)).toString()).to.equal("Bacon.when([Bacon.never()],function)")

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
      [0, 1, 0, 1, 3, 0, 1, 0, 0, 2, 3])

  describe "Correctly handles multiple arguments in parameter list, and synchronous sources", ->
    expectPropertyEvents(
      ->
        one = Bacon.once(1)
        two = Bacon.once(2)
        Bacon.update(
          0,
          [one, two],  (i, a, b) -> [i,a,b])
      [0, [0,1,2]], unstable)
  it "Rejects patterns with Properties only", -> expectError("At least one EventStream required", ->
    Bacon.update(0, [Bacon.constant()], ->))
  it "toString", ->
    expect(Bacon.update(0, [Bacon.never()], (->)).toString()).to.equal("Bacon.update(0,[Bacon.never()],function)")

describe "combineTemplate", ->
  describe "combines streams and properties according to a template object", ->
    expectPropertyEvents(
      ->
         name = Bacon.constant({first:"jack", last:"bauer"})
         stuff = later(1, { key: "value" })
         Bacon.combineTemplate({ name, stuff })
      [{ name: { first:"jack", last:"bauer"}, stuff: {key:"value"}}])
  describe "combines properties according to a template object", ->
    expectPropertyEvents(
      ->
         firstName = Bacon.constant("juha")
         lastName = Bacon.constant("paananen")
         userName = Bacon.constant("mr.bacon")
         Bacon.combineTemplate({ userName: userName, password: "*****", fullName: { firstName: firstName, lastName: lastName }})
      [{ userName: "mr.bacon", password: "*****", fullName: { firstName: "juha", lastName: "paananen" } }])
  describe "works with a single-stream template", ->
    expectPropertyEvents(
      ->
        bacon = Bacon.constant("bacon")
        Bacon.combineTemplate({ favoriteFood: bacon })
      [{ favoriteFood: "bacon" }])
  describe "works when dynamic part is not the last part (bug fix)", ->
    expectPropertyEvents(
      ->
        username = Bacon.constant("raimohanska")
        password = Bacon.constant("easy")
        Bacon.combineTemplate({url: "/user/login",
        data: { username: username, password: password }, type: "post"})
      [url: "/user/login", data: {username: "raimohanska", password: "easy"}, type: "post"])
  describe "works with arrays as data (bug fix)", ->
    expectPropertyEvents(
      -> Bacon.combineTemplate( { x : Bacon.constant([]), y : Bacon.constant([[]]), z : Bacon.constant(["z"])})
      [{ x : [], y : [[]], z : ["z"]}])
  describe "supports empty object", ->
    expectPropertyEvents(
      -> Bacon.combineTemplate({})
      [{}])
  it "supports arrays", ->
    value = {key: [{ x: 1 }, { x: 2 }]}
    Bacon.combineTemplate(value).onValue (x) ->
      expect(x).to.deep.equal(value)
      expect(x.key instanceof Array).to.deep.equal(true) # seems that the former passes even if x is not an array
    value = [{ x: 1 }, { x: 2 }]
    Bacon.combineTemplate(value).onValue (x) ->
      expect(x).to.deep.equal(value)
      expect(x instanceof Array).to.deep.equal(true)
    value = {key: [{ x: 1 }, { x: 2 }], key2: {}}
    Bacon.combineTemplate(value).onValue (x) ->
      expect(x).to.deep.equal(value)
      expect(x.key instanceof Array).to.deep.equal(true)
    value = {key: [{ x: 1 }, { x: Bacon.constant(2) }]}
    Bacon.combineTemplate(value).onValue (x) ->
      expect(x).to.deep.equal({key: [{ x: 1 }, { x: 2 }]})
      expect(x.key instanceof Array).to.deep.equal(true) # seems that the former passes even if x is not an array
  it "supports nulls", ->
    value = {key: null}
    Bacon.combineTemplate(value).onValue (x) ->
      expect(x).to.deep.equal(value)
  it "supports NaNs", ->
    value = {key: NaN}
    Bacon.combineTemplate(value).onValue (x) ->
      expect(isNaN(x.key)).to.deep.equal(true)
  it "supports dates", ->
    value = {key: new Date()}
    Bacon.combineTemplate(value).onValue (x) ->
      expect(x).to.deep.equal(value)
  it "supports regexps", ->
    value = {key: /[0-0]/i}
    Bacon.combineTemplate(value).onValue (x) ->
      expect(x).to.deep.equal(value)
  it "supports functions", ->
    value = {key: ->}
    Bacon.combineTemplate(value).onValue (x) ->
      expect(x).to.deep.equal(value)
  it "toString", ->
    expect(Bacon.combineTemplate({ thing: Bacon.never(), const: "a" }).toString()).to.equal("Bacon.combineTemplate({thing:Bacon.never(),const:a})")

describe "Bacon.retry", ->
  describe "does not retry after value", ->
    expectStreamEvents(
      ->
        calls = 0
        source = ->
          calls += 1
          Bacon.once({calls})
        Bacon.retry({source, retries: 2})
      [calls: 1])
  describe "retries to run the source stream given number of times until it yields a value", ->
    expectStreamEvents(
      ->
        calls = 0
        source = ->
          calls += 1
          if calls < 3
            Bacon.once(new Bacon.Error())
          else
            Bacon.once({calls})
        Bacon.retry({source, retries: 5})
      [calls: 3])
  describe "does not change source stream characteristics", ->
    expectStreamEvents(
      -> Bacon.retry(source: -> fromArray([3, 1, 2, 1, 3]).skipDuplicates().take(2))
      [3, 1])
  describe "retries after retryable error", ->
    expectStreamEvents(
      ->
        calls = 0
        source = ->
          calls += 1
          Bacon.once(new Bacon.Error({calls}))
        isRetryable = ({calls}) ->
          calls < 2
        Bacon.retry({source, isRetryable, retries: 5})
      [error(calls: 2)]) # TODO: assert error content
  describe "yields error when no retries left", ->
    expectStreamEvents(
      ->
        calls = 0
        source = ->
          calls += 1
          Bacon.once(new Bacon.Error({calls}))
        Bacon.retry {source, retries: 2}
      [error(calls: 3)]) # TODO: assert error content
  it "allows specifying delay by context for each retry", (done) ->
    calls = 0
    contexts = []
    source = ->
      calls += 1
      Bacon.once(new Bacon.Error({calls}))
    delay = (context) ->
      contexts.push(context)
      1
    Bacon.retry({source, delay, retries: 2}).onError (err) ->
      expect(contexts).to.deep.equal [
        {error: {calls: 1}, retriesDone: 0}
        {error: {calls: 2}, retriesDone: 1}
      ]
      expect(err).to.deep.equal {calls: 3}
      done()
  it "calls source function after delay", (done) ->
    calls = 0
    source = ->
      calls += 1
      Bacon.once(new Bacon.Error())
    interval = -> 100
    Bacon.retry({source, interval, retries: 1}).onValue -> # noop
    expect(calls).to.equal 1
    done()
  it "throws exception if 'source' option is not a function", ->
    expect(-> Bacon.retry(source: "ugh")).to.throw "'source' option has to be a function"
  it "toString", ->
    expect(Bacon.retry({source: -> Bacon.once(1)}).toString()).to.equals("Bacon.retry({source:function})")

describe "Property.decode", ->
  describe "switches between source Properties based on property value", ->
    expectPropertyEvents(
      ->
        a = Bacon.constant("a")
        b = Bacon.constant("b")
        c = Bacon.constant("c")
        series(1, [1,2,3]).toProperty().decode({1: a, 2: b, 3: c})
      ["a", "b", "c"])
  it "toString", ->
    expect(Bacon.constant(1).decode({1: "lol"}).toString()).to.equal("Bacon.constant(1).decode({1:lol})")

describe "EventStream.decode", ->
  describe "switches between source Properties based on property value", ->
    expectPropertyEvents(
      ->
        a = Bacon.constant("a")
        b = Bacon.constant("b")
        c = Bacon.constant("c")
        series(1, [1,2,3]).decode({1: a, 2: b, 3: c})
      ["a", "b", "c"])

describe "Observable.onValues", ->
  it "splits value array to callback arguments", ->
    f = mockFunction()
    Bacon.constant([1,2,3]).onValues(f)
    f.verify(1,2,3)

describe "Bacon.onValues", ->
  it "is a shorthand for combineAsArray.onValues", ->
    f = mockFunction()
    Bacon.onValues(1, 2, 3, f)
    f.verify(1,2,3)

describe "Observable.subscribe and onValue", ->
  it "returns a dispose() for unsubscribing", ->
    s = new Bacon.Bus()
    values = []
    dispose = s.onValue (value) -> values.push value
    s.push "lol"
    dispose()
    s.push "wut"
    expect(values).to.deep.equal(["lol"])
  it "respects returned Bacon.noMore return value (#523)", ->
    calls = 0
    Bacon.once(1).merge(Bacon.interval(100, 2)).subscribe (event) ->
      calls++
      Bacon.noMore
    expect(calls).to.equal(1)
    # will hang if the underlying interval-stream isn't disposed correctly


describe "Observable.onEnd", ->
  it "is called on stream end", ->
    s = new Bacon.Bus()
    ended = false
    s.onEnd(-> ended = true)
    s.push("LOL")
    expect(ended).to.deep.equal(false)
    s.end()
    expect(ended).to.deep.equal(true)

describe "Field value extraction", ->
  describe "extracts field value", ->
    expectStreamEvents(
      -> Bacon.once({lol:"wut"}).map(".lol")
      ["wut"])
  describe "extracts nested field value", ->
    expectStreamEvents(
      -> Bacon.once({lol:{wut: "wat"}}).map(".lol.wut")
      ["wat"])
  describe "yields 'undefined' if any value on the path is 'undefined'", ->
    expectStreamEvents(
      -> Bacon.once({}).map(".lol.wut")
      [undefined])
  it "if field value is method, it does a method call", ->
    context = null
    result = null
    object = {
      method: ->
        context = this
        "result"
    }
    Bacon.once(object).map(".method").onValue((x) -> result = x)
    expect(result).to.deep.equal("result")
    expect(context).to.deep.equal(object)

testSideEffects = (wrapper, method) ->
  ->
    it "(f) calls function with property value", ->
      f = mockFunction()
      wrapper("kaboom")[method](f)
      f.verify("kaboom")
    it "(f, param) calls function, partially applied with param", ->
      f = mockFunction()
      wrapper("kaboom")[method](f, "pow")
      f.verify("pow", "kaboom")
    it "('.method') calls event value object method", ->
      value = mock("get")
      value.when().get().thenReturn("pow")
      wrapper(value)[method](".get")
      value.verify().get()
    it "('.method', param) calls event value object method with param", ->
      value = mock("get")
      value.when().get("value").thenReturn("pow")
      wrapper(value)[method](".get", "value")
      value.verify().get("value")
    it "(object, method) calls object method with property value", ->
      target = mock("pow")
      wrapper("kaboom")[method](target, "pow")
      target.verify().pow("kaboom")
    it "(object, method, param) partially applies object method with param", ->
      target = mock("pow")
      wrapper("kaboom")[method](target, "pow", "smack")
      target.verify().pow("smack", "kaboom")
    it "(object, method, param1, param2) partially applies with 2 args", ->
      target = mock("pow")
      wrapper("kaboom")[method](target, "pow", "smack", "whack")
      target.verify().pow("smack", "whack", "kaboom")

describe "Property.onValue", testSideEffects(Bacon.constant, "onValue")
describe "Property.assign", testSideEffects(Bacon.constant, "assign")
describe "EventStream.onValue", testSideEffects(Bacon.once, "onValue")
describe "EventStream.forEach", testSideEffects(Bacon.once, "forEach")

describe "Property.assign", ->
  it "calls given objects given method with property values", ->
    target = mock("pow")
    Bacon.constant("kaboom").assign(target, "pow")
    target.verify().pow("kaboom")
  it "allows partial application of method (i.e. adding fixed args)", ->
    target = mock("pow")
    Bacon.constant("kaboom").assign(target, "pow", "smack")
    target.verify().pow("smack", "kaboom")
  it "allows partial application of method with 2 args (i.e. adding fixed args)", ->
    target = mock("pow")
    Bacon.constant("kaboom").assign(target, "pow", "smack", "whack")
    target.verify().pow("smack", "whack", "kaboom")

describe "EventStream", ->
  describe "works with functions as values (bug fix)", ->
    expectStreamEvents(
      -> Bacon.once(-> "hello").map((f) -> f())
      ["hello"])
    expectStreamEvents(
      -> Bacon.once(-> "hello").flatMap(Bacon.once).map((f) -> f())
      ["hello"])
    expectPropertyEvents(
      -> Bacon.constant(-> "hello").map((f) -> f())
      ["hello"])
    expectStreamEvents(
      -> Bacon.constant(-> "hello").flatMap(Bacon.once).map((f) -> f())
      ["hello"])
  it "handles one subscriber added twice just like two separate subscribers (case Bacon.noMore)", ->
    values = []
    bus = new Bacon.Bus()
    f = (v) ->
      if v.hasValue()
        values.push(v.value())
        return Bacon.noMore
    bus.subscribe(f)
    bus.subscribe(f)
    bus.push("bacon")
    expect(values).to.deep.equal(["bacon", "bacon"])
  it "handles one subscriber added twice just like two separate subscribers (case unsub)", ->
    values = []
    bus = new Bacon.Bus()
    f = (v) ->
      if v.hasValue()
        values.push(v.value())
    bus.subscribe(f)
    unsub = bus.subscribe(f)
    unsub()
    bus.push("bacon")
    expect(values).to.deep.equal(["bacon"])

describe "String presentations", ->
  describe "Initial(1).toString", -> 
    it "is 1", ->
      expect(new Bacon.Initial(1).toString()).to.equal("1")
  describe "Next({a:1i}).toString", -> 
    it "is {a:1}", ->
      expect(new Bacon.Next({a:1}).toString()).to.equal("{a:1}")
  describe "Error({a:1}).toString", ->
    it "is <error> {a:1}", ->
      expect(new Bacon.Error({a:1}).toString()).to.equal("<error> {a:1}")
  describe "End.toString", ->
    it "is <end>", ->
      expect(new Bacon.End().toString()).to.equal("<end>")
  describe "inspect", ->
    it "is the same as toString", ->
      expect(new Bacon.Initial(1).inspect()).to.equal("1")

describe "Observable.name", ->
  it "sets return value of toString and inspect", ->
    expect(Bacon.once(1).name("one").toString()).to.equal("one")
    expect(Bacon.once(1).name("one").inspect()).to.equal("one")
  it "modifies the stream in place", ->
    obs = Bacon.once(1)
    obs.name("one")
    expect(obs.toString()).to.equal("one")
  it "supports composition", ->
    expect(Bacon.once("raimohanska").name("raimo").take(1).inspect()).to.equal("raimo.take(1)")

describe "Observable.withDescription", ->
  it "affects toString and inspect", ->
    expect(Bacon.once(1).withDescription(Bacon, "una", "mas").inspect()).to.equal("Bacon.una(mas)")
  it "affects desc", ->
    description = Bacon.once(1).withDescription(Bacon, "una", "mas").desc
    expect(description.context).to.equal(Bacon)
    expect(description.method).to.equal("una")
    expect(description.args).to.deep.equal(["mas"])

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
      testSpy 1, -> Bacon.once(1)
    it "Property", ->
      testSpy 1, -> Bacon.constant(1)
    it "map", ->
      testSpy 2, -> Bacon.once(1).map(->)
    it "combineTemplate (also called for the intermediate combineAsArray property)", ->
      testSpy 5, -> Bacon.combineTemplate([Bacon.once(1), Bacon.constant(2)])

describe "Infinite synchronous sequences", ->
  describe "Limiting length with take(n)", ->
    expectStreamEvents(
      -> endlessly(1,2,3).take(4)
      [1,2,3,1], unstable)
    expectStreamEvents(
      -> endlessly(1,2,3).take(4).concat(Bacon.once(5))
      [1,2,3,1,5], unstable)
    expectStreamEvents(
      -> endlessly(1,2,3).take(4).concat(endlessly(5, 6).take(2))
      [1,2,3,1,5,6], unstable)
  describe "With flatMap", ->
    expectStreamEvents(
      -> fromArray([1,2]).flatMap((x) -> endlessly(x)).take(2)
      [1,1], unstable)
    expectStreamEvents(
      -> endlessly(1,2).flatMap((x) -> endlessly(x)).take(2)
      [1,1], unstable)

describe "Exceptions", ->
  it "are thrown through the stack", ->
    b = new Bacon.Bus()
    b.take(1).flatMap(-> throw "testing testing").onValue(->)
    expect(-> b.push()).to.throw("testing testing")
    values = []
    b.take(1).onValue((x) -> values.push(x))
    b.push("after exception")
    expect(values).to.deep.equal(["after exception"])


endlessly = (values...) ->
  index = 0
  Bacon.fromSynchronousGenerator -> new Bacon.Next(-> values[index++ % values.length])

Bacon.fromGenerator = (generator) ->
  fromBinder (sink) ->
    unsubd = false
    push = (events) ->
      events = Bacon._.toArray(events)
      for event in events
        return if unsubd
        reply = sink event
        return if event.isEnd() or reply == Bacon.noMore
      generator(push)
    push []
    -> unsubd = true

Bacon.fromSynchronousGenerator = (generator) ->
  Bacon.fromGenerator (push) ->
    push generator()

describe "Integration tests", ->
  describe "Property.skipDuplicates", ->
    describe "Doesn't skip initial value (bug fix #211)", ->
      b = new Bacon.Bus()
      p = b.toProperty()
      p.onValue -> # force property update
      s = p.skipDuplicates()
      b.push 'foo'

      describe "series 1", ->
        expectPropertyEvents((-> s.take(1)), ["foo"])
      describe "series 2", ->
        expectPropertyEvents((-> s.take(1)), ["foo"])
      describe "series 3", ->
        expectPropertyEvents((-> s.take(1)), ["foo"])
  describe "EventStream.skipDuplicates", ->
    it "Drops duplicates with subscribers with non-overlapping subscription time (#211)", ->
      b = new Bacon.Bus()
      noDups = b.skipDuplicates()
      round = (expected) ->
        values = []
        noDups.take(1).onValue (x) -> values.push(x)
        b.push 1
        expect(values).to.deep.equal(expected)
      round([1])
      round([])
      round([])
  describe "EventStream.flatMap", ->
    describe "works with a complex setup (fix #363)", ->
      it "case 1 (samplee has no subscribers)", ->
        result = ""
        prop = Bacon.combineTemplate(faq: later(1).toProperty("default value"))
        Bacon.once().flatMap(->
            problem = prop.sampledBy(Bacon.once())
            problem.onValue (x) ->
              result = x
        ).onValue ->
        expect(result).to.deep.equal({faq: "default value"})
      it "case 2 (samplee has subscriber)", ->
        result = ""
        prop = Bacon.combineTemplate(faq: later(1).toProperty("default value"))
        prop.onValue ->
        Bacon.once().flatMap(->
            problem = prop.sampledBy(Bacon.once())
            problem.onValue (x) ->
              result = x
        ).onValue ->
        expect(result).to.deep.equal({faq: "default value"})
      it "case 3 (original fiddle)", ->
        result = ""
        input = new Bacon.Bus()
        prop = Bacon.combineTemplate(faq: input.toProperty("default value"))
        events = new Bacon.Bus()
        events.flatMapLatest(->
            problem = prop.sampledBy(Bacon.once())
            problem.onValue (x) ->
              result = x
        ).onValue ->
        events.push()
        expect(result).to.deep.equal({faq: "default value"})
  describe "Property.flatMap", ->
    describe "works in a complex scenario #338", ->
      expectStreamEvents(
        -> 
          a = activate(series(2, ["a", "A"]))
          b = activate(series(2, ["b", "B"])).delay(1).toProperty()
          a.flatMapLatest((a) -> b.map((b) -> a + b))
        ["ab", "Ab", "AB"], unstable)

  describe "EventStream.flatMapLatest", ->
    describe "No glitches in a complex scenario", ->
      expectPropertyEvents(
        ->
          changes = series(1, [{a:0,b:0},{a:1,b:1}])

          a = changes.map '.a'
          b = changes.map '.b'

          ab = Bacon.combineAsArray a, b

          f = ab.flatMapLatest (values) ->
            Bacon.once 'f' + values

          Bacon.combineAsArray(f, b).map(".0")
        ["f0,0","f1,1"])

    it "Works with flatMap source spawning fromArrays", ->
      result = []
      array = [1,2,3]
      fromArray(array)
        .map(array)
        .flatMap(fromArray)
        .flatMapLatest(Bacon._.id)
        .onValue (v) -> result.push v
      expect(result).to.deep.equal([1,2,3,1,2,3,1,2,3])
  describe "EventStream.debounce", ->
    describe "works in combination with scan", ->
      count = 0
      expectPropertyEvents(
        -> series(2, [1,2,3]).debounce(1).scan(0, (x,y) -> count++; x + y)
        [0, 1, 3, 6]
        {extraCheck: -> it "calls function once per value", -> expect(count).to.equal(3)}
      )
  describe "Property.debounce", ->
    it "works with Bacon.combine (bug fix)", ->
      values = []
      p1 = Bacon.once(true).toProperty()
      p2 = Bacon.once(true).toProperty()
      visibleP = Bacon.combineAsArray([p1, p2]).startWith(false)
      visibleP.debounce(500).onValue (val)  ->
        values.push(val)

