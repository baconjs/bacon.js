# build-dependencies: startwith, filter, delay, interval, take, bus, mapEnd, map, merge, doaction, holdwhen, takeWhile

describe "EventStream.bufferingConcat", ->
  describe "provides values from streams in given order and ends when both are exhausted", ->
    expectStreamEvents(
      ->
        left = series(2, [1, error(), 2, 3])
        right = series(1, [4, 5, 6])
        left.bufferingConcat(right)
      [1, error(), 2, 3, 4, 5, 6], unstable)
  describe "respects subscriber return value when providing events from left stream", ->
    expectStreamEvents(
      ->
        left = take(3, repeat(3, [1, 3]))
        right = take(3, repeat(2, [1]))
        left.bufferingConcat(right).takeWhile(lessThan(2))
      [1])
  describe "respects subscriber return value when providing events from right stream", ->
    expectStreamEvents(
      ->
        left = series(3, [1, 2])
        right = series(2, [2, 3, 4, 6])
        left.bufferingConcat(right).takeWhile(lessThan(4))
      [1, 2, 2, 3], unstable)
  describe "works with Bacon.never()", ->
    expectStreamEvents(
      -> Bacon.never().bufferingConcat(Bacon.never())
      [])
  describe "works with Bacon.once()", ->
    expectStreamEvents(
      -> once(2).bufferingConcat(once(1))
      [2, 1])
  describe "works with Bacon.once() and Bacon.never()", ->
    expectStreamEvents(
      -> once(1).bufferingConcat(Bacon.never())
      [1])
  describe "works with Bacon.never() and Bacon.once()", ->
    expectStreamEvents(
      -> Bacon.never().bufferingConcat(once(1))
      [1])
  describe "works with Bacon.once() and async source", ->
    expectStreamEvents(
      -> once(1).bufferingConcat(series(1, [2, 3]))
      [1, 2, 3])
  describe "works with Bacon.once() and fromArray()", ->
    expectStreamEvents(
      -> once(1).bufferingConcat(fromArray([2, 3]))
      [1, 2, 3], semiunstable)
  it "toString", ->
    expect(Bacon.never().bufferingConcat(Bacon.never()).toString()).to.equal("Bacon.never().bufferingConcat(Bacon.never())")
    
