require('when/es6-shim/Promise')

describe "firstToPromise", ->
  it "picks the first event from Observable, later", ->
    Bacon.later(3, "foobar").firstToPromise().then (x) ->
      expect(x).to.equal("foobar")

  it "picks the first event from Observable, sequentially", ->
    Bacon.sequentially(3, [1, 2, 3]).firstToPromise().then (x) ->
      expect(x).to.equal(1)

  it.skip "never resolves with undefined from empty Observable", ->
    Bacon.sequentially(3, []).firstToPromise().then (x) ->
      expect(x).to.equal(undefined)

describe "toPromise", ->
  it "picks the last event from Observable, later", ->
    Bacon.later(3, "foobar").toPromise().then (x) ->
      expect(x).to.equal("foobar")

  it "picks the last event from Observable, sequentially", ->
    Bacon.sequentially(3, [1, 2, 3]).toPromise().then (x) ->
      expect(x).to.equal(3)

  it.skip "never resolves with undefined from empty Observable", ->
    Bacon.sequentially(3, []).toPromise().then (x) ->
      expect(x).to.equal(undefined)
