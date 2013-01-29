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

describe "Bacon.fromPromise", ->
  it "should produce value and end on success", ->
    events = []
    Bacon.fromPromise(promise).subscribe( (e) => events.push(e))
    success("a")
    expect(_.map(((e) -> e.describe()), events)).toEqual(["a", "<end>"])

  it "should produce error and end on error", ->
    events = []
    Bacon.fromPromise(promise).subscribe( (e) => events.push(e))
    fail("a")
    expect(events).toEqual([new Bacon.Error("a"), new Bacon.End()])

  it "should respect unsubscription", ->
    events = []
    dispose = Bacon.fromPromise(promise).subscribe( (e) => events.push(e))
    dispose()
    success("a")
    expect(events).toEqual([])

