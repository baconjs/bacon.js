describe "EventStream.awaiting(other)", ->
  describe "indicates whether s1 has produced output after s2 (or only the former has output so far)", ->
    expectPropertyEvents(
      -> series(2, [1, 1]).awaiting(series(3, [2]))
      [false, true, false, true])
  describe "supports Properties", ->
    expectPropertyEvents(
      -> series(2, [1, 1]).awaiting(series(3, [2]).toProperty())
      [false, true, false, true])
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
    expect(Bacon.never().awaiting(Bacon.once(1)).toString()).to.equal("Bacon.never().awaiting(Bacon.once(1))")

describe "Property.awaiting(other)", ->
  describe "indicates whether p1 has produced output after p2 (or only the former has output so far)", ->
    expectPropertyEvents(
      -> series(2, [1, 1]).toProperty().awaiting(series(3, [2]))
      [false, true, false, true])

