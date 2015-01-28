testLiftedCallback = (src, liftedCallback) ->
  input = [
    Bacon.constant('a')
    'x'
    Bacon.constant('b').toProperty()
    'y'
  ]
  output = ['a', 'x', 'b', 'y']
  expectStreamEvents(
    -> liftedCallback(src, input...)
    [output]
  )


describe "Bacon.fromCallback", ->
  describe "makes an EventStream from function that takes a callback", ->
    expectStreamEvents(
      ->
        src = (callback) -> callback("lol")
        stream = Bacon.fromCallback(src)
      ["lol"])
  describe "supports partial application", ->
    expectStreamEvents(
      ->
        src = (param, callback) -> callback(param)
        stream = Bacon.fromCallback(src, "lol")
      ["lol"])
  describe "supports partial application with Observable arguments", ->
    testLiftedCallback(
      (values..., callback) -> callback(values)
      Bacon.fromCallback
    )
  describe "supports object, methodName, partial application", ->
    expectStreamEvents(
      ->
        src = { 
                "go": (param, callback) -> callback(param + " " + this.name)
                "name": "bob" 
              }
        stream = Bacon.fromCallback(src, "go", "hello")
      ["hello bob"])
  it "toString", ->
    expect(Bacon.fromCallback((->), "lol").toString()).to.equal("Bacon.fromCallback(function,lol)")

describe "Bacon.fromNodeCallback", ->
  describe "makes an EventStream from function that takes a node-style callback", ->
    expectStreamEvents(
      ->
        src = (callback) -> callback(null, "lol")
        stream = Bacon.fromNodeCallback(src)
      ["lol"])
  describe "handles error parameter correctly", ->
    expectStreamEvents(
      ->
        src = (callback) -> callback('errortxt', null)
        stream = Bacon.fromNodeCallback(src)
      [error()])
  describe "supports partial application", ->
    expectStreamEvents(
      ->
        src = (param, callback) -> callback(null, param)
        stream = Bacon.fromNodeCallback(src, "lol")
      ["lol"])
  describe "supports partial application with Observable arguments", ->
    testLiftedCallback(
      (values..., callback) -> callback(null, values)
      Bacon.fromNodeCallback
    )
  describe "supports object, methodName, partial application", ->
    expectStreamEvents(
      ->
        src = { 
                "go": (param, callback) -> callback(null, param + " " + this.name)
                "name": "bob" 
              }
        stream = Bacon.fromNodeCallback(src, "go", "hello")
      ["hello bob"])
  it "toString", ->
    expect(Bacon.fromNodeCallback((->), "lol").toString()).to.equal("Bacon.fromNodeCallback(function,lol)")


