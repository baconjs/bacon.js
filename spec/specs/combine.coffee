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
  it "toString", ->
    expect(Bacon.combineWith((->), Bacon.never()).toString()).to.equal("Bacon.combineWith(function,Bacon.never())")

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

describe "Bacon.onValues", ->
  it "is a shorthand for combineAsArray.onValues", ->
    f = mockFunction()
    Bacon.onValues(1, 2, 3, f)
    f.verify(1,2,3)

