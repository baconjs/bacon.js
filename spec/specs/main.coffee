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
  describe "EventStream.concat", ->
    describe "Works with synchronized left stream and doAction", ->
      expectStreamEvents(
        ->
          bus = new Bacon.Bus()
          stream = fromArray([1,2]).flatMapLatest (x) ->
            Bacon.once(x).concat(later(10, x).doAction((x) -> bus.push(x); bus.end()))
          stream.onValue ->
          bus
        [2])
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
        ["ab", "Ab", "AB"], semiunstable)

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
        ["f0,0","f1,1"], semiunstable)

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
      once(1).merge(Bacon.interval(100, 2)).subscribe (event) ->
        calls++
        Bacon.noMore
      expect(calls).to.equal(1)
      # will hang if the underlying interval-stream isn't disposed correctly

  describe "Exceptions", ->
    it "are thrown through the stack", ->
      b = new Bacon.Bus()
      b.take(1).flatMap(-> throw "testing testing").onValue(->)
      expect(-> b.push()).to.throw("testing testing")
      values = []
      b.take(1).onValue((x) -> values.push(x))
      b.push("after exception")
      expect(values).to.deep.equal(["after exception"])


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
          root = series(1, [1,2]).toProperty()
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
    describe "Calling Bus.end() in onValue", ->
      it "works correctly in combination with takeUntil (#517)", (done) ->
        values = []
        bus = new (Bacon.Bus)
        s = once(1).merge(Bacon.later(10, 2))
        ends = bus.mapEnd()
        s.takeUntil(ends).onValue (value) ->
          values.push value
          bus.end()
        verify = ->
          expect(values).to.deep.equal([1])
          done()
        Bacon.scheduler.setTimeout verify, 20
