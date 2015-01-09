expect = require("chai").expect
Bacon = (require "../dist/Bacon").Bacon

_ = Bacon._
nop = ->

# Synchronous promise
class Promise
  constructor: (callback) ->
    self = this
    @state = "pending"
    @resolves = []
    @rejects = []

    resolve = (value) ->
      _.each self.resolves, (idx, f) ->
        f(value)

    reject = (error) ->
      _.each self.rejects, (idx, f) ->
        f(error)

    callback resolve, reject

  abort: () ->
    @state = "aborted"
    @resolves = []
    @rejects = []

  then: (resolveHandler, rejectHandler) ->
    self = this
    new Promise (resolve, reject) ->
      self.resolves.push (value) ->
        if typeof resolveHandler == "function"
          resolve(resolveHandler(value))
        else
          resolve(value)

      self.rejects.push (error) ->
        if typeof rejectHandler == "function"
          resolve(rejectHandler(error))
        else
          reject(error)

defer = () ->
  resolve = undefined
  reject = undefined
  promise = new Promise (resolveF, rejectF) ->
    resolve = resolveF
    reject = rejectF
  resolve: resolve
  reject: reject
  promise: promise

defer = () ->
  resolve = undefined
  reject = undefined
  promise = new Promise (resolveF, rejectF) ->
    resolve = resolveF
    reject = rejectF
  resolve: resolve
  reject: reject
  promise: promise

describe "Bacon.fromPromise", ->
  it "should produce value and end on success", ->
    events = []
    deferred = defer()
    Bacon.fromPromise(deferred.promise).subscribe( (e) => events.push(e))
    deferred.resolve("a")
    expect(_.map(((e) -> e.toString()), events)).to.deep.equal(["a", "<end>"])

  it "should produce error and end on error", ->
    events = []
    deferred = defer()
    Bacon.fromPromise(deferred.promise).subscribe( (e) => events.push(e))
    deferred.reject("a")
    expect(events.map((e) -> e.toString())).to.deep.equal(["<error> a", "<end>"])

  it "should respect unsubscription", ->
    events = []
    deferred = defer()
    dispose = Bacon.fromPromise(deferred.promise).subscribe( (e) => events.push(e))
    dispose()
    deferred.resolve("a")
    expect(events).to.deep.equal([])

  it "should abort ajax promise on unsub, if abort flag is set", ->
    deferred = defer()
    dispose = Bacon.fromPromise(deferred.promise, true).subscribe(nop)
    dispose()
    expect(deferred.promise.state).to.equal("aborted")

  it "should not abort ajax promise on unsub, if abort flag is not set", ->
    deferred = defer()
    dispose = Bacon.fromPromise(deferred.promise).subscribe(nop)
    dispose()
    expect(deferred.promise.state).to.deep.equal("pending")

  it "should not abort non-ajax promise", ->
    deferred = defer()
    dispose = Bacon.fromPromise(deferred.promise).subscribe(nop)
    dispose()
    expect(deferred.promise.state).to.equal("pending")
