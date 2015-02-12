# build-dependencies: take, concat, flatmap

describe "Bacon.fromStreamGenerator", ->
  describe "Polls new streams from generator function until empty result", ->
    expectStreamEvents(
      ->
        count = 0
        Bacon.fromStreamGenerator ->
          count++
          if count <= 3
            later(1, count)
          else
            Bacon.never()
      [1,2,3])
  describe "Works with synchronous streams", ->
    expectStreamEvents(
      ->
        count = 0
        Bacon.fromStreamGenerator ->
          count++
          if count <= 3
            Bacon.once(count)
          else
            Bacon.never()
      [1,2,3], unstable)
  describe "Works with endless asynchronous generators", ->
    expectStreamEvents(
      ->
        take(3, Bacon.fromStreamGenerator(-> later(0, 1)))
      [1,1,1])
  describe "Works with endless asynchronous streams", ->
    expectStreamEvents(
      ->
        take(3, Bacon.fromStreamGenerator(-> repeatedly(1, [1])))
      [1,1,1])
  describe "Works with endless synchronous streams", ->
    expectStreamEvents(
      ->
        take(3, Bacon.fromStreamGenerator(-> endlessly(1)))
      [1,1,1])
  describe "Works with endless synchronous generators", ->
    expectStreamEvents(
      ->
        take(3, Bacon.fromStreamGenerator(-> Bacon.once(1)))
      [1,1,1], unstable)

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

endlessly = (values...) ->
  index = 0
  Bacon.fromSynchronousGenerator -> new Bacon.Next(-> values[index++ % values.length])
