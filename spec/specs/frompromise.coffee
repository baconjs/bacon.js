Bluebird = require("bluebird")

describe "Bacon.fromPromise", ->
  describe "With Bluebird", ->
    describe "on success", ->
      expectStreamEvents(
        -> Bacon.fromPromise(new Bluebird((res, rej) -> res("ok")))
        ["ok"])
    describe "on error", ->
      expectStreamEvents(
        -> Bacon.fromPromise(new Bluebird((res, rej) -> rej("fail")))
        [error("fail")])
  describe "With mock Promise", ->
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

    it "should support custom event transformer", ->
      transformer = (value) -> [value.toUpperCase(), new Bacon.End]
      events = []
      Bacon.fromPromise(promise, false, transformer).subscribe( (e) => events.push(e))
      success("a")
      expect(_.map(((e) -> e.toString()), events)).to.deep.equal(["A", "<end>"])

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


    describe 'with kind of promise-chain that ends with .done()', ->
      stream = null
      chainEnd = false
      beforeEach ->
        chainEnd = false
        # this promise tries to mimick the behaviour of kriskowal/q, where
        # not calling .done() at the end of the chain will result in
        # exceptions going nowhere.
        promise = {
          then: (s, f) ->
            fail = (v) ->
              try
                f(v)
              catch err
                throw err if chainEnd
            success = (v) ->
              try
                s(v)
              catch err
                if chainEnd then throw err else fail(err)
            done: -> chainEnd = true
        }
        stream = Bacon.fromPromise promise

      it "should not swallow .onValue() errors", ->
        stream.onValue (e) -> throw new Error("fail value")
        expect(->success('success')).to.throw 'fail value'

      it "should not swallow .onError() errors", ->
        stream.onError (e) -> throw new Error("fail error")
        expect(->fail('fail')).to.throw 'fail error'
