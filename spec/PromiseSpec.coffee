expect = require("chai").expect
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
    expect(_.map(((e) -> e.toString()), events)).to.deep.equal(["a", "<end>"])

  it "should produce error and end on error", ->
    events = []
    Bacon.fromPromise(promise).subscribe( (e) => events.push(e))
    fail("a")
    expect(events.map((e) -> e.toString())).to.deep.equal(["<error> a", "<end>"])

  it "should respect unsubscription", ->
    events = []
    dispose = Bacon.fromPromise(promise).subscribe( (e) => events.push(e))
    dispose()
    success("a")
    expect(events).to.deep.equal([])

  it "should abort ajax promise on unsub, if abort flag is set", ->
    isAborted = false
    promise.abort = ->
      isAborted = true
    dispose = Bacon.fromPromise(promise, true).subscribe(nop)
    dispose()
    delete promise.abort
    expect(isAborted).to.deep.equal(true)
  
  it "should not abort ajax promise on unsub, if abort flag is not set", ->
    isAborted = false
    promise.abort = ->
      isAborted = true
    dispose = Bacon.fromPromise(promise).subscribe(nop)
    dispose()
    delete promise.abort
    expect(isAborted).to.deep.equal(false)

  it "should not abort non-ajax promise", ->
    isAborted = false
    dispose = Bacon.fromPromise(promise).subscribe(nop)
    dispose()
    expect(isAborted).to.deep.equal(false)
