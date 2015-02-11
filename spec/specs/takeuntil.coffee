# build-dependencies: filter, bus

describe "EventStream.takeUntil", ->
  describe "takes elements from source until an event appears in the other stream", ->
    expectStreamEvents(
      ->
        src = repeat(3, [1, 2, 3])
        stopper = repeat(7, ["stop!"])
        src.takeUntil(stopper)
      [1, 2], unstable)
  describe "works on self-derived stopper", ->
    expectStreamEvents(
      ->
        src = repeat(3, [3, 2, 1])
        stopper = src.filter(lessThan(3))
        src.takeUntil(stopper)
      [3])
  describe "works on self-derived stopper with an evil twist", ->
    expectStreamEvents(
      ->
        src = repeat(3, [3, 2, 1])
        data = src.map((x) -> x)
        take(3, data).onValue(->)
        stopper = src.filter(lessThan(3))
        data.takeUntil(stopper)
      [3])
  describe "includes source errors, ignores stopper errors", ->
    expectStreamEvents(
      ->
        src = repeat(2, [1, error(), 2, 3])
        stopper = mergeAll(repeat(7, ["stop!"]), repeat(1, [error()]))
        src.takeUntil(stopper)
      [1, error(), 2], unstable)
  describe "works with Property as stopper", ->
    expectStreamEvents(
      ->
        src = repeat(3, [1, 2, 3])
        stopper = repeat(7, ["stop!"]).toProperty()
        src.takeUntil(stopper)
      [1, 2], unstable)
  describe "considers Property init value as stopper", ->
    expectStreamEvents(
      ->
        src = repeat(3, [1, 2, 3])
        stopper = Bacon.constant("stop")
        src.takeUntil(stopper)
      [])
  describe "ends immediately with synchronous stopper", ->
    expectStreamEvents(
      ->
        src = repeat(3, [1, 2, 3])
        stopper = Bacon.once("stop")
        src.takeUntil(stopper)
      [])
  describe "ends properly with a never-ending stopper", ->
    expectStreamEvents(
      ->
        src = series(1, [1,2,3])
        stopper = new Bacon.Bus()
        src.takeUntil(stopper)
      [1,2,3])
  describe "ends properly with a never-ending stopper and synchronous source", ->
    expectStreamEvents(
      ->
        src = fromArray([1,2,3]).mapEnd("finito")
        stopper = new Bacon.Bus()
        src.takeUntil(stopper)
      [1,2,3, "finito"])
  describe "unsubscribes its source as soon as possible", ->
     expectStreamEvents(
       ->
        startTick = sc.now()
        later(20)
        .onUnsub(->
          expect(sc.now()).to.equal(startTick + 1))
        .takeUntil later(1)
      [])
  describe "it should unsubscribe its stopper on end", ->
     expectStreamEvents(
       ->
         startTick = sc.now()
         later(1,'x').takeUntil(later(20).onUnsub(->
           expect(sc.now()).to.equal(startTick + 1)))
       ['x'])
  describe "it should unsubscribe its stopper on no more", ->
     expectStreamEvents(
       ->
         startTick = sc.now()
         later(1,'x').takeUntil(later(20).onUnsub(->
           expect(sc.now()).to.equal(startTick + 1)))
       ['x'])
  ### TODO does not pass
  describe "works with synchronous self-derived sources", ->
    expectStreamEvents(
      ->
        a = Bacon.fromArray [1,2]
        b = a.filter((x) -> x >= 2)
        a.takeUntil b
      [1])
  ###
  it "toString", ->
    expect(later(1, "a").takeUntil(later(2, "b")).toString()).to.equal("Bacon.later(1,a).takeUntil(Bacon.later(2,b))")


