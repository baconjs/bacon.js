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

  it "unsubscribes stream after an error", (done) ->
    bus = new Bacon.Bus
    values = []
    observable = bus[Symbol.observable]()
    observable.subscribe
      next: (x) ->
        values.push(x)

    bus.push(1)
    bus.error('error')
    bus.push(2)

    expect(values).to.deep.equal([1])
    done()
