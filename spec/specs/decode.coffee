describe "Property.decode", ->
  describe "switches between source Properties based on property value", ->
    expectPropertyEvents(
      ->
        a = Bacon.constant("a")
        b = Bacon.constant("b")
        c = Bacon.constant("c")
        series(1, [1,2,3]).toProperty().decode({1: a, 2: b, 3: c})
      ["a", "b", "c"])
  it "toString", ->
    expect(Bacon.constant(1).decode({1: "lol"}).toString()).to.equal("Bacon.constant(1).decode({1:lol})")

describe "EventStream.decode", ->
  describe "switches between source Properties based on property value", ->
    expectPropertyEvents(
      ->
        a = Bacon.constant("a")
        b = Bacon.constant("b")
        c = Bacon.constant("c")
        series(1, [1,2,3]).decode({1: a, 2: b, 3: c})
      ["a", "b", "c"])
