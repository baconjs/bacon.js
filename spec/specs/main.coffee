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
  describe "Property.sampleBy", ->
    describe "uses updated property after combine", ->
      latter = (a, b) -> b
      expectPropertyEvents(
        ->
          src = series(2, ["b", "c"]).toProperty("a")
          combined = Bacon.constant().combine(src, latter)
          src.sampledBy(combined, add)
        ["aa", "bb", "cc"])
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
  describe "uses updated property after combine with subscriber", ->
    latter = (a, b) -> b
    expectPropertyEvents(
      ->
        src = series(2, ["b", "c"]).toProperty("a")
        combined = Bacon.constant().combine(src, latter)
        combined.onValue(->)
        src.sampledBy(combined, add)
      ["aa", "bb", "cc"])
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
  describe "Property.startWith", ->
    it "works with combineAsArray", ->
      result = null
      a = Bacon.constant("lolbal")
      result = Bacon.combineAsArray([a.map(true), a.map(true)]).map("right").startWith("wrong")
      result.onValue((x) -> result = x)
      expect(result).to.equal("right")

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
