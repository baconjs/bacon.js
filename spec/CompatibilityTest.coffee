# A pruned version of BaconSpec, just to see if it runs nicer in Testling.CI
expect = require("chai").expect
Bacon = (require "../src/Bacon").Bacon
Mocks = (require "./Mock")
TickScheduler = (require "./TickScheduler").TickScheduler
mock = Mocks.mock
mockFunction = Mocks.mockFunction
EventEmitter = require("events").EventEmitter
th = require("./SpecHelper")
t = th.t
expectStreamEvents = th.expectStreamEvents
expectPropertyEvents = th.expectPropertyEvents
verifyCleanup = th.verifyCleanup
error = th.error
soon = th.soon
series = th.series
repeat = th.repeat
toValues = th.toValues
sc = TickScheduler()
Bacon.scheduler = sc

describe "Bacon.later", ->
  describe "should send single event and end", ->
    expectStreamEvents( 
      -> Bacon.later(t(1), "lol")
      ["lol"])

describe "Bacon.sequentially", ->
  describe "should send given events and end", ->
    expectStreamEvents(
      -> Bacon.sequentially(t(1), ["lol", "wut"])
      ["lol", "wut"])

testLiftedCallback = (src, liftedCallback) ->
  input = [
    Bacon.constant('a')
    'x'
    Bacon.constant('b').toProperty()
    'y'
  ]
  output = ['a', 'x', 'b', 'y']
  expectStreamEvents(
    -> liftedCallback(src, input...)
    [output]
  )


describe "Bacon.fromCallback", ->
  describe "makes an EventStream from function that takes a callback", ->
    expectStreamEvents(
      ->
        src = (callback) -> callback("lol")
        stream = Bacon.fromCallback(src)
      ["lol"])

describe "Bacon.fromNodeCallback", ->
  describe "makes an EventStream from function that takes a node-style callback", ->
    expectStreamEvents(
      ->
        src = (callback) -> callback(null, "lol")
        stream = Bacon.fromNodeCallback(src)
      ["lol"])
  describe "supports partial application with Observable arguments", ->
    testLiftedCallback(
      (values..., callback) -> callback(null, values)
      Bacon.fromNodeCallback
    )

# Wrap EventEmitter as EventTarget
toEventTarget = (emitter) ->
  addEventListener: (event, handler) -> 
    emitter.addListener(event, handler)
  removeEventListener: (event, handler) -> emitter.removeListener(event, handler)

describe "Bacon.fromEventTarget", ->
  soon = (f) -> setTimeout f, 0
  describe "should create EventStream from DOM object", ->
    expectStreamEvents(
      -> 
        emitter = new EventEmitter()
        emitter.on "newListener", ->
          soon -> emitter.emit "click", "x"
        element = toEventTarget emitter
        Bacon.fromEventTarget(element, "click").take(1)
      ["x"]
    )

describe "EventStream.filter", ->
  describe "should filter values", ->
    expectStreamEvents(
      -> series(1, [1, 2, error(), 3]).filter(lessThan(3))
      [1, 2, error()])
  describe "extracts field values", ->
    expectStreamEvents(
      -> series(1, [{good:true, value:"yes"}, {good:false, value:"no"}]).filter(".good").map(".value")
      ["yes"])
  describe "can filter by Property value", ->
    expectStreamEvents(
      ->
        src = series(1, [1,1,2,3,4,4,8,7])
        odd = src.map((x) -> x % 2).toProperty()
        src.filter(odd)
      [1,1,3,7])

describe "EventStream.map", ->
  describe "should map with given function", ->
    expectStreamEvents(
      -> series(1, [1, 2, 3]).map(times, 2)
      [2, 4, 6])
  describe "also accepts a constant value", ->
    expectStreamEvents(
      -> series(1, [1, 2, 3,]).map("lol")
      ["lol", "lol", "lol"])
  describe "extracts property from value object", ->
    o = { lol : "wut" }
    expectStreamEvents(
      -> repeat(1, [o]).take(3).map(".lol")
      ["wut", "wut", "wut"])


describe "EventStream.mapEnd", ->
  describe "produces an extra element on stream end", ->
    expectStreamEvents(
      -> series(1, ["1", error()]).mapEnd("the end")
      ["1", error(), "the end"])
  describe "accepts either a function or a constant value", ->
    expectStreamEvents(
      -> series(1, ["1", error()]).mapEnd(-> "the end")
      ["1", error(), "the end"])
  describe "works with undefined value as well", ->
    expectStreamEvents(
      -> series(1, ["1", error()]).mapEnd()
      ["1", error(), undefined])

describe "EventStream.take", ->
  describe "takes N first elements", ->
    expectStreamEvents(
      -> series(1, [1,2,3,4]).take(2)
      [1,2])
  describe "works with synchronous source", ->
    expectStreamEvents(
      -> Bacon.fromArray([1,2,3,4]).take(2)
      [1,2])

describe "EventStream.takeWhile", ->
  describe "takes while predicate is true", ->
    expectStreamEvents(
      -> repeat(1, [1, error("wat"), 2, 3]).takeWhile(lessThan(3))
      [1, error("wat"), 2])
  describe "extracts field values", ->
    expectStreamEvents(
      -> series(1, [{good:true, value:"yes"}, {good:false, value:"no"}])
           .takeWhile(".good").map(".value")
      ["yes"])
  describe "can filter by Property value", ->
    expectStreamEvents(
      ->
        src = series(1, [1,1,2,3,4,4,8,7])
        odd = src.map((x) -> x % 2).toProperty()
        src.takeWhile(odd)
      [1,1])

describe "EventStream.skip", ->
  describe "should skip first N items", ->
    expectStreamEvents(
      -> series(1, [1, error(), 2, error(), 3]).skip(1)
    [error(), 2, error(), 3])
  describe "accepts N <= 0", ->
    expectStreamEvents(
      -> series(1, [1, 2]).skip(-1)
    [1, 2])
  describe "works with synchronous source", ->
    expectStreamEvents(
      -> Bacon.fromArray([1, 2, 3]).skip(1)
    [2, 3])

describe "EventStream.skipWhile", ->
  describe "skips filter predicate holds true", ->
    expectStreamEvents(
      -> series(1, [1, error(), 2, error(), 3, 2]).skipWhile(lessThan(3))
      [error(), error(), 3, 2])
  describe "can filter by Property value", ->
    expectStreamEvents(
      ->
        src = series(1, [1,1,2,3,4,4,8,7])
        odd = src.map((x) -> x % 2).toProperty()
        src.skipWhile(odd)
      [2,3,4,4,8,7])

describe "EventStream.skipUntil", ->
  describe "skips events until one appears in given starter stream", ->
    expectStreamEvents(
      ->
        src = series(3, [1,2,3])
        src.onValue(->) # to start "time" immediately instead of on subscribe
        starter = series(4, ["start"])
        src.skipUntil(starter)
      [2,3])

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
  describe "should spawn new stream for each value and collect results into a single stream", ->
    expectStreamEvents(
      -> series(1, [1, 2]).flatMap (value) ->
        Bacon.sequentially(t(2), [value, error(), value])
      [1, 2, error(), error(), 1, 2])

describe "Property.flatMap", ->
  describe "should spawn new stream for all events including Init", ->
    expectStreamEvents(
      ->
        once = (x) -> Bacon.once(x)
        series(1, [1, 2]).toProperty(0).flatMap(once)
      [0, 1, 2])


describe "EventStream.merge", ->
  describe "merges two streams and ends when both are exhausted", ->
    expectStreamEvents(
      ->
        left = series(1, [1, error(), 2, 3])
        right = series(1, [4, 5, 6]).delay(t(4))
        left.merge(right)
      [1, error(), 2, 3, 4, 5, 6])

describe "EventStream.delay", ->
  describe "delays all events (except errors) by given delay in milliseconds", ->
    expectStreamEvents(
      ->
        left = series(2, [1, 2, 3])
        right = series(1, [error(), 4, 5, 6]).delay(t(6))
        left.merge(right)
      [error(), 1, 2, 3, 4, 5, 6])

describe "EventStream.debounce", ->
  describe "throttles input by given delay, passing-through errors", ->
    expectStreamEvents(
      -> series(2, [1, error(), 2]).debounce(t(7))
      [error(), 2])

describe "EventStream.bufferWithTimeOrCount", ->
  describe "flushes on count", ->
    expectStreamEvents(
      -> series(1, [1, 2, 3, error(), 4, 5]).bufferWithTimeOrCount(t(10), 2)
      [[1, 2], error(), [3, 4], [5]])
  describe "flushes on timeout", ->
    expectStreamEvents(
      -> series(2, [error(), 1, 2, 3, 4, 5, 6, 7]).bufferWithTimeOrCount(t(7), 10)
      [error(), [1, 2, 3, 4], [5, 6, 7]])

describe "EventStream.takeUntil", ->
  describe "takes elements from source until an event appears in the other stream", ->
    expectStreamEvents(
      ->
        src = repeat(3, [1, 2, 3])
        stopper = repeat(7, ["stop!"])
        src.takeUntil(stopper)
      [1, 2])

describe "Bacon.never", ->
  describe "should send just end", ->
    expectStreamEvents(
      -> Bacon.never()
      [])

describe "Bacon.once", ->
  describe "should send single event and end", ->
    expectStreamEvents(
      -> Bacon.once("pow")
      ["pow"])
  describe "accepts an Error event as parameter", ->
    expectStreamEvents(
      -> Bacon.once(new Bacon.Error("oop"))
      [error()])

describe "EventStream.concat", ->
  describe "provides values from streams in given order and ends when both are exhausted", ->
    expectStreamEvents(
      ->
        left = series(2, [1, error(), 2, 3])
        right = series(1, [4, 5, 6])
        left.concat(right)
      [1, error(), 2, 3, 4, 5, 6])

describe "EventStream.startWith", ->
  describe "provides seed value, then the rest", ->
    expectStreamEvents(
      ->
        left = series(1, [1, 2, 3])
        left.startWith('pow')
      ['pow', 1, 2, 3])
  describe "works with synchronous source", ->
    expectStreamEvents(
      ->
        left = Bacon.fromArray([1, 2, 3])
        left.startWith('pow')
      ['pow', 1, 2, 3])

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
     -> Bacon.fromArray([1,2,3]).toProperty(0).changes()
     [1,2,3])

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

describe "Bacon.combineAsArray", ->
  describe "combines properties and latest values of streams, into a Property having arrays as values", ->
    expectPropertyEvents(
      ->
        stream = series(1, ["a", "b"])
        Bacon.combineAsArray([Bacon.constant(1), Bacon.constant(2), stream])
      [[1, 2, "a"], [1, 2, "b"]])

describe "Bacon.combineWith", ->
  describe "combines n properties, streams and constants using an n-ary function", ->
    expectPropertyEvents(
      ->
        stream = series(1, [1, 2])
        f = (x, y, z) -> x + y + z
        Bacon.combineWith(f, stream, Bacon.constant(10), 100)
      [111, 112])

describe "Bacon.mergeAll", ->
  describe ("merges all given streams"), ->
    expectStreamEvents(
      ->
        Bacon.mergeAll([
          series(3, [1, 2])
          series(3, [3, 4]).delay(t(1))
          series(3, [5, 6]).delay(t(2))])
      [1, 3, 5, 2, 4, 6])

describe "Property.sampledBy(stream)", ->
  describe "samples property at events, resulting to EventStream", ->
    expectStreamEvents(
      ->
        prop = series(2, [1, 2]).toProperty()
        stream = repeat(3, ["troll"]).take(4)
        prop.sampledBy(stream)
      [1, 2, 2, 2])
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
      -> Bacon.fromArray([1,2,3]).scan(0, ((x,y)->x+y))
      [0,1,3,6])

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
      -> Bacon.fromArray([1,2,3]).withStateMachine(0, f)
      [6])

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
  describe "does not synchronize on properties", ->
    expectStreamEvents(
      ->
        obs = series(1, [1, 2, 3, 4])
        Bacon.zipAsArray(obs, obs.skip(1), Bacon.constant(5))
    [[1 , 2, 5], [2 , 3, 5], [3, 4, 5]])

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
      ['a', 'ab', 'a', 'ab', 'ab', 'ab'])
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
  describe "works with synchronous sources", ->
    expectStreamEvents(
      ->
        xs = Bacon.once "x"
        ys = Bacon.once "y"
        Bacon.when(
          [xs, ys], (x, y) -> x + y
        )
      ["xy"])

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
describe "combineTemplate", ->
  describe "combines streams according to a template object", ->
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

describe "Bacon.onValues", ->
  it "is a shorthand for combineAsArray.onValues", ->
    f = mockFunction()
    Bacon.onValues(1, 2, 3, f)
    f.verify(1,2,3)

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

describe "Bacon.Bus", ->
  it "merges plugged-in streams", ->
    bus = new Bacon.Bus()
    values = []
    dispose = bus.onValue (value) -> values.push value
    push = new Bacon.Bus()
    bus.plug(push)
    push.push("lol")
    expect(values).to.deep.equal(["lol"])
    dispose()
    verifyCleanup()
  describe "works with looped streams", ->
    expectStreamEvents(
      ->
        bus = new Bacon.Bus()
        bus.plug(Bacon.later(t(2), "lol"))
        bus.plug(bus.filter((value) => "lol" == value).map(=> "wut"))
        Bacon.later(t(4)).onValue(=> bus.end())
        bus
      ["lol", "wut"])

describe "Bacon.fromBinder", ->
  describe "Provides an easier alternative to the EventStream constructor, allowing sending multiple events at a time", ->
    expectStreamEvents(
      -> 
        Bacon.fromBinder (sink) ->
          sink([new Bacon.Next(1), new Bacon.End()])
          (->)
      [1])

lessThan = (limit) ->
  (x) -> x < limit
times = (x, y) -> x * y
add = (x, y) -> x + y
id = (x) -> x

