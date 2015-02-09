describe "Boolean logic", ->
  describe "combines Properties with and()", ->
    expectPropertyEvents(
      -> Bacon.constant(true).and(Bacon.constant(false))
      [false])
  describe "combines Properties with or()", ->
    expectPropertyEvents(
      -> Bacon.constant(true).or(Bacon.constant(false))
      [true])
  describe "inverts property with not()", ->
    expectPropertyEvents(
      -> Bacon.constant(true).not()
      [false])
  describe "accepts constants instead of properties", ->
    describe "true and false", ->
      expectPropertyEvents(
        -> Bacon.constant(true).and(false)
        [false])
    describe "true and true", ->
      expectPropertyEvents(
        -> Bacon.constant(true).and(true)
        [true])
    describe "true or false", ->
      expectPropertyEvents(
        -> Bacon.constant(true).or(false)
        [true])
  it "toString", ->
    expect(Bacon.constant(1).and(Bacon.constant(2).not()).or(Bacon.constant(3)).toString()).to.equal("Bacon.constant(1).and(Bacon.constant(2).not()).or(Bacon.constant(3))")

