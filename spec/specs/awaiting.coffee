# build-dependencies: flatmap
describe "EventStream.awaiting(other)", ->
  describe "indicates whether s1 has produced output after s2 (or only the former has output so far)", ->
    expectPropertyEvents(
      -> series(2, [1, 1]).awaiting(series(3, [2]))
      [false, true, false, true], semiunstable)
  describe "supports awaiting Properties", ->
    expectPropertyEvents(
      -> series(2, [1, 1]).awaiting(series(3, [2]).toProperty())
      [false, true, false, true], semiunstable)
  describe "supports simultaneouts events", ->
    expectPropertyEvents(
      ->
        src = later(1, 1)
        src.awaiting(src.map(->))
      [false])
    expectPropertyEvents(
      ->
        src = later(1, 1)
        src.map(->).awaiting(src)
      [false])
  it "toString", ->
    expect(Bacon.never().awaiting(Bacon.never()).toString()).to.equal("Bacon.never().awaiting(Bacon.never())")

describe "Property.awaiting(other)", ->
  describe "works for awaiting self", ->
    expectPropertyEvents(
      ->
        p = Bacon.constant(1)
        p.awaiting(p)
      [false])
  describe "indicates whether p1 has produced output after p2 (or only the former has output so far)", ->
    expectPropertyEvents(
      -> series(2, [1, 1]).toProperty().awaiting(series(3, [2]))
      [false, true, false, true], semiunstable)
  describe "works for awaiting self.map", ->
    expectPropertyEvents(
      ->
        p = Bacon.constant(1)
        p.awaiting(p.map())
      [false])
  describe "works for awaiting self.flatMap", ->
    expectPropertyEvents(
      ->
        p = Bacon.constant(1)
        p.awaiting(p.flatMap((x) -> once(x)))
      [true, false], unstable)
