# build-dependencies: factories

describe "Observable.doLog", ->
  preservingLog = (f) ->
    originalConsole = console
    originalLog = console.log
    try
      f()
    finally
      global.console = originalConsole
      console.log = originalLog

  it "does not consume the event", (done) ->
    streamWithOneEvent = once({}).doLog('hello bacon')
    streamWithOneEvent.onValue(->
      done()
    )
  it "does not crash", ->
    preservingLog ->
      console.log = ->
      Bacon.constant(1).doLog().onValue()
  it "does not crash in case console.log is not defined", ->
    preservingLog ->
      console.log = undefined
      Bacon.constant(1).doLog().onValue()
  it "logs event values as themselves (doesn't stringify)", ->
    loggedValues = undefined
    preservingLog ->
      console.log = (args...) -> loggedValues = args
      Bacon.constant(1).doLog(true).onValue(->)
    expect(loggedValues[0]).to.equal(true)
  it "logs Error events as strings", (done) ->
    loggedValues = undefined
    preservingLog ->
      console.log = (args...) -> loggedValues = args
      new Bacon.Error('err').doLog(true).onValue(->)
    expect(loggedValues).to.equal(true)
  it "logs End events as strings", (done) ->
    loggedValues = undefined
    preservingLog ->
      console.log = (args...) -> loggedValues = args
      new Bacon.End().doLog(true).onValue(->)
    expect(loggedValues).to.equal(true)
  it "toString", ->
    expect(Bacon.never().doLog().toString()).to.equal("Bacon.never().doLog()")


