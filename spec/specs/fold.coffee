describe "EventStream.fold", ->
  describe "folds stream into a single-valued Property, passes through errors", ->
    expectPropertyEvents(
      -> series(1, [1, 2, error(), 3]).fold(0, add)
      [error(), 6])
  describe "has reduce as synonym", ->
    expectPropertyEvents(
      -> series(1, [1, 2, error(), 3]).fold(0, add)
      [error(), 6])
  describe "works with synchronous source", ->
    expectPropertyEvents(
      -> fromArray([1, 2, error(), 3]).fold(0, add)
      [error(), 6], unstable)
  describe.skip "works with really large chunks too, with { eager: true }", ->
    count = 50000
    expectPropertyEvents(
      -> series(1, [1..count]).fold(0, ((x,y) -> x+1), { eager: true })
      [count])

describe "Property.fold", ->
  describe "Folds Property into a single-valued one", ->
    expectPropertyEvents(
      -> series(1, [2,3]).toProperty(1).fold(0, add)
      [6])
