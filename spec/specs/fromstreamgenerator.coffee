# build-dependencies: take, concat, flatmap, fromgenerator

describe "Bacon.fromStreamGenerator", ->
  describe "Polls new streams from generator function until empty result", ->
    expectStreamEvents(
      ->
        count = 0
        Bacon.fromStreamGenerator ->
          count++
          if count <= 3
            later(1, count)
      [1,2,3])
  describe "Works with synchronous streams", ->
    expectStreamEvents(
      ->
        count = 0
        Bacon.fromStreamGenerator ->
          count++
          if count <= 3
            Bacon.once(count)
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


