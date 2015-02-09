# build-dependencies: EventStream, Property
describe "Property.map", ->
  describe "maps property values", ->
    expectPropertyEvents(
      ->
        sequentially(1, [2, new Bacon.Error()]).toProperty(1).map(times, 2)
      [2, 4, error()])

