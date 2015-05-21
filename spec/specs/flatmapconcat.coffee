describe "EventStream.flatMapConcat", ->
  describe "is like flatMapWithConcurrencyLimit(1)", ->
    expectStreamEvents(
      -> series(1, [1, 2]).flatMapConcat((value) ->
        series(t(2), [value, error(), value]))
      [1, error(), 1, 2, error(), 2], semiunstable)
  describe "Respects function construction rules", ->
    expectStreamEvents(
      -> Bacon.once({ bacon: Bacon.once("sir francis")}).flatMapConcat(".bacon")
      ["sir francis"])
  it "toString", ->
    expect(Bacon.once(1).flatMapConcat(->).toString()).to.equal("Bacon.once(1).flatMapConcat(function)")


