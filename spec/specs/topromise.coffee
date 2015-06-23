# build-dependencies: frompromise
require('when/es6-shim/Promise')
Bluebird = require "bluebird"

describe "firstToPromise", ->
  it "picks the first event from Observable, later", ->
    later(3, "foobar").firstToPromise().then (x) ->
      expect(x).to.equal("foobar")

  it "picks the first event from Observable, sequentially", ->
    sequentially(3, [1, 2, 3]).firstToPromise().then (x) ->
      expect(x).to.equal(1)

  it.skip "never resolves with undefined from empty Observable", ->
    sequentially(3, []).firstToPromise().then (x) ->
      expect(x).to.equal(undefined)

describe "toPromise", ->
  it "picks the last event from Observable, later", ->
    later(3, "foobar").toPromise().then (x) ->
      expect(x).to.equal("foobar")
  
  it "works with synchronous sources", ->
    fromArray([1,2,3]).toPromise().then (x) ->
      expect(x).to.equal(3)

  it "picks the last event from Observable, sequentially", ->
    sequentially(3, [1, 2, 3]).toPromise().then (x) ->
      expect(x).to.equal(3)

  it "never resolves with undefined from empty Observable", ->
    called = false
    Bacon.never().toPromise().then(-> called = true)
    expect(called).to.equal(false)

  it "supports custom Promise constructor", ->
    promise = once("hi").toPromise(Bluebird)
    expect(promise.constructor).to.equal(Bluebird)
    promise.then (x) ->
      expect(x).to.equal("hi")
