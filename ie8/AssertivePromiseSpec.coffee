assert = require("assertive-chai").assert
Bacon = (require "../src/Bacon").Bacon

success = undefined
fail = undefined
calls = 0
promise = {
  then: (s, f) ->
    success = s
    fail = f
    calls = calls + 1
}
_ = Bacon._
nop = ->

describe "Bacon.fromPromise", ->
  it "should produce value and end on success", ->
    events = []
    Bacon.fromPromise(promise).subscribe( (e) => events.push(e))
    success("a")
    assert.deepEqual _.map(((e) -> e.toString()), events), ["a", "<end>"]

  it "should produce error and end on error", ->
    events = []
    Bacon.fromPromise(promise).subscribe( (e) => events.push(e))
    fail("a")
    assert.deepEqual events.map((e) -> e.toString()), ["<error> a", "<end>"]

  it "should respect unsubscription", ->
    events = []
    dispose = Bacon.fromPromise(promise).subscribe( (e) => events.push(e))
    dispose()
    success("a")
    assert.deepEqual events, []

  it "should abort ajax promise on unsub, if abort flag is set", ->
    isAborted = false
    promise.abort = ->
      isAborted = true
    dispose = Bacon.fromPromise(promise, true).subscribe(nop)
    dispose()
    delete promise.abort
    assert.deepEqual isAborted, true
  
  it "should not abort ajax promise on unsub, if abort flag is not set", ->
    isAborted = false
    promise.abort = ->
      isAborted = true
    dispose = Bacon.fromPromise(promise).subscribe(nop)
    dispose()
    delete promise.abort
    assert.deepEqual isAborted, false

  it "should not abort non-ajax promise", ->
    isAborted = false
    dispose = Bacon.fromPromise(promise).subscribe(nop)
    dispose()
    assert.deepEqual isAborted, false

