Observable = require('zen-observable')
Rx = require('@reactivex/rxjs')

describe "Bacon.fromESObservable", ->
  describe "turns an ES7 observable into an EventStream", ->
    expectStreamEvents(
      -> Bacon.fromESObservable(Observable.of(1, 2))
      [1, 2], semiunstable)

  describe "ends stream after an error", ->
    expectStreamEvents(
      ->
        observable = new Observable((observer) ->
          observer.next(1)
          observer.error()
        )
        Bacon.fromESObservable(observable)
      [1, "<error>"], semiunstable)

  describe "turns an RxJS observable into an EventStream", ->
    expectStreamEvents(
      -> Bacon.fromESObservable(Rx.Observable.of('hello world'))
      ['hello world'], semiunstable)
