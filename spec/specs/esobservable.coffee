Bacon = require("../../src/core").default
expect = require("chai").expect
{
  expectStreamEvents,
  expectPropertyEvents,
  series,
  error,
  semiunstable
} = require("../SpecHelper")
Observable = require 'zen-observable'

describe "EventStream[Symbol.observable]", ->
  it "outputs compatible Observable", (done) ->
    bus = new Bacon.Bus
    values = []
    observable = Observable.from(bus)
    observable.subscribe
      next: (x) ->
        values.push(x)
      complete: (x) ->
        expect(values).to.deep.equal([1, 2, 3])
        done()

    bus.push(1)
    bus.push(2)
    bus.push(3)
    bus.end()

  it "keeps subscription closed updated when stream ends", ->
    bus = new Bacon.Bus
    observable = Observable.from(bus)
    subscription = observable.subscribe
      next: (x) ->
      complete: (x) ->

    expect(subscription.closed).to.equal(false)
    bus.end()
    expect(subscription.closed).to.equal(true)

  it "keeps subscription closed updated when unsubscribing", ->
    bus = new Bacon.Bus
    observable = Observable.from(bus)
    subscription = observable.subscribe
      next: (x) ->
      complete: (x) ->


    expect(subscription.closed).to.equal(false)
    subscription.unsubscribe()
    expect(subscription.closed).to.equal(true)

  it "unsubscribes stream after an error", (done) ->
    bus = new Bacon.Bus
    values = []
    observable = bus.toESObservable()
    observable.subscribe
      next: (x) -> values.push(x)

    bus.push(1)
    bus.error('error')
    bus.push(2)

    expect(values).to.deep.equal([1])
    done()

  it 'supports subscribe(onNext, onError, onCompete) format', ->
    bus = new Bacon.Bus
    values = []
    errors = []
    completes = []
    onValue = (x) -> values.push(x)
    onError = (x) -> errors.push(x)
    onComplete = (x) -> completes.push(x)
    observable = bus.toESObservable()
    observable.subscribe(onValue, onError, onComplete)
    bus.push(1)
    bus.error(2)
    bus.end()
    expect(values).to.deep.equal([1])
    expect(errors).to.deep.equal([2])
    expect(completes).to.deep.equal([])
