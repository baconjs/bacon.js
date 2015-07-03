describe "EventStream.flatMapWithConcurrencyLimit", ->
  describe "limits the number of concurrently active spawned streams by queuing", ->
    expectStreamEvents(
      -> series(1, [1, 2]).flatMapWithConcurrencyLimit(1, (value) ->
        series(t(2), [value, error(), value]))
      [1, error(), 1, 2, error(), 2], semiunstable)
  describe "works with n=2", ->
    expectStreamEvents(
      -> series(1, [1,2,3]).flatMapWithConcurrencyLimit(2, (value) ->
        series(t(2), [value, value]))
      [1, 2, 1, 2, 3, 3], semiunstable)
  describe "Respects function construction rules", ->
    expectStreamEvents(
      -> Bacon.once({ bacon: Bacon.once("sir francis")}).flatMapWithConcurrencyLimit(1, ".bacon")
      ["sir francis"])
  it "toString", ->
    expect(Bacon.once(1).flatMapWithConcurrencyLimit(2, ->).toString())
      .to.equal("Bacon.once(1).flatMapWithConcurrencyLimit(2,function)")


