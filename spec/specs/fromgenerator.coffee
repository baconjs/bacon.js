# build-dependencies: take, concat, flatmap

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
