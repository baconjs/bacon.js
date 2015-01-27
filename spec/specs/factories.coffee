describe "Bacon.fromBinder", ->
  describe "Provides an easier alternative to the EventStream constructor, allowing sending multiple events at a time", ->
    expectStreamEvents(
      ->
        Bacon.fromBinder (sink) ->
          sink([new Bacon.Next(1), new Bacon.End()])
          (->)
      [1])
  describe "Allows sending unwrapped values as well as events", ->
    expectStreamEvents(
      ->
        Bacon.fromBinder (sink) ->
          sink([1, new Bacon.End()])
          (->)
      [1])
  describe "Allows sending single value without wrapping array", ->
    expectStreamEvents(
      ->
        Bacon.fromBinder (sink) ->
          sink(1)
          sink(new Bacon.End())
          (->)
      [1])
  describe "unbind works in synchronous case", ->
    expectStreamEvents( ->
        Bacon.fromBinder (sink) ->
          unsubTest = Bacon.scheduler.setInterval((->), 10)
          sink("hello")
          sink(new Bacon.End())
          ->
            # test hangs if any interval is left uncleared
            Bacon.scheduler.clearInterval(unsubTest)
      ,
      ["hello"])

  it "calls unbinder only once", ->
    unbound = 0
    output = undefined
    timer = Bacon.fromBinder((sink) ->
        output = sink
        -> unbound++
    )
    timer.onValue(-> Bacon.noMore)
    output "hello"
    expect(unbound).to.equal(1)

  it "toString", ->
    expect(Bacon.fromBinder(->).toString()).to.equal("Bacon.fromBinder(function,function)")

describe "Bacon.once", ->
  describe "should send single event and end", ->
    expectStreamEvents(
      -> Bacon.once("pow")
      ["pow"])
  describe "accepts an Error event as parameter", ->
    expectStreamEvents(
      -> Bacon.once(new Bacon.Error("oop"))
      [error()])
  describe "Allows wrapped events, for instance, Bacon.Error", ->
    expectStreamEvents(
      -> Bacon.once(error())
      [error()])
  it "Responds synchronously", ->
    values = []
    s = Bacon.once(1)
    s.onValue(values.push.bind(values))
    expect(values).to.deep.equal([1])
    s.onValue(values.push.bind(values))
    expect(values).to.deep.equal([1])

describe "Bacon.fromArray", ->
  describe "Turns an empty array into an EventStream", ->
    expectStreamEvents(
      -> Bacon.fromArray([])
      [])
  describe "Turns a single-element array into an EventStream", ->
    expectStreamEvents(
      -> Bacon.fromArray([1])
      [1])
  describe "Turns a longer array into an EventStream", ->
    expectStreamEvents(
      -> Bacon.fromArray([1, 2, 3])
      [1, 2, 3])
  describe "Allows wrapped events, for instance, Bacon.Error", ->
    expectStreamEvents(
      -> Bacon.fromArray([error(), 1])
      [error(), 1])
  it "toString", ->
    expect(Bacon.fromArray([1,2]).toString()).to.equal("Bacon.fromArray([1,2])")
  it "doesn't mutate the given array, toString works after subscribe (bug fix)", ->
    array = [1,2]
    s = Bacon.fromArray(array)
    s.onValue(->)
    expect(s.toString()).to.equal("Bacon.fromArray([1,2])")
    expect(array).to.deep.equal([1,2])

describe "Bacon.never", ->
  describe "should send just end", ->
    expectStreamEvents(
      -> Bacon.never()
      [])
