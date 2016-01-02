require("../../src/doaction")
require("../../src/doerror")
require("../../src/flatmap")
require("../../src/try")
Bacon = require("../../src/bacon").Bacon
expect = require("chai").expect

describe "Bacon.try", ->
  it "maps the value over the function", ->
    Bacon
      .once('{"valid json": true}')
      .flatMap(Bacon.try(JSON.parse))
      .doError(() -> throw "Bacon.try test failed")
      .onValue(() -> "all ok")

  it "returns a Bacon.Error if the mapper function throws an exception", ->
    Bacon
      .once('{"invalid json: true}')
      .flatMap(Bacon.try(JSON.parse))
      .doAction(() -> throw "Bacon.try test failed")
      .onError((err) ->
        if err instanceof SyntaxError
          "all ok"
        else
          throw "Bacon.try did not emit an expected error event"
      )
