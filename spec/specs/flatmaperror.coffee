describe "EventStream.flatMapError", ->
  describe "allows spawning a new stream from an error", ->
    expectStreamEvents(
      ->
        source = fromArray [
          error()
          error(value: true, data: 1)
          error()
          error(value: true, data: 2)
        ]
        source.flatMapError (err) ->
          if err?.value
            Bacon.once(err.data)
          else
            error()

      [error(), 1, error(), 2]
    )
  describe "has no effect on values", ->
    expectStreamEvents(
      -> fromArray([1, 2]).flatMapError(-> Bacon.once("omg"))
      [1, 2])
  it "toString", ->
    expect(Bacon.once(1).flatMapError(->).toString()).to.equal("Bacon.once(1).flatMapError(function)")

