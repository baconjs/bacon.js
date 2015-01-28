# build-dependencies: factories

describe "Observable.log", ->
  preservingLog = (f) ->
    originalConsole = console
    originalLog = console.log
    try
      f()
    finally
      global.console = originalConsole
      console.log = originalLog

  it "does not crash", ->
    preservingLog ->
      console.log = ->
      Bacon.constant(1).log()
  it "does not crash in case console.log is not defined", ->
    preservingLog ->
      console.log = undefined
      Bacon.constant(1).log()
  it "logs event values as themselves (doesn't stringify)", ->
    value = {}
    expect(new Bacon.Next(value).log()).to.equal(value)
  it "logs Error, End events as strings", ->
    expect(new Bacon.Error("err").log()).to.equal("<error> err")
    expect(new Bacon.End().log()).to.equal("<end>")
  it "toString", ->
    expect(Bacon.never().log().toString()).to.equal("Bacon.never()")


