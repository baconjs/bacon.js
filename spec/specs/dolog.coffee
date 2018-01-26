require("../../src/dolog")
Bacon = require("../../src/core").default
expect = require("chai").expect

{
  expectStreamEvents,
  once,
  deferred
} = require("../SpecHelper")

describe "Observable.doLog", ->
  originalConsole = console
  originalLog = console.log
  restoreLog = ->
      global.console = originalConsole
      console.log = originalLog
  preservingLog = (f) ->
    try
      f()
    finally
      restoreLog()

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
  it "logs Error events as strings", ->
    loggedValues = undefined
    console.log = (args...) -> loggedValues = args
    once(Bacon.Error('err')).doLog(true).onValue(->)
    deferred -> 
      expect(loggedValues).to.deep.equal [true, '<end>']
      restoreLog()
  it "logs End events as strings", ->
    loggedValues = undefined
    console.log = (args...) -> loggedValues = args
    once(new Bacon.End()).doLog(true).onValue(->)
    deferred -> 
      expect(loggedValues).to.deep.equal [true, '<end>']
      restoreLog()
  it "toString", ->
    expect(Bacon.never().doLog().toString()).to.equal("Bacon.never().doLog()")
