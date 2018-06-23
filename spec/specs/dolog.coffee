Bacon = require("../../dist/Bacon")
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
  it "logs event values as themselves (doesn't stringify), and End events as strings", ->
    loggedValues = []
    preservingLog ->
      console.log = (args...) -> loggedValues.push(args)
      Bacon.constant(1).doLog(true).onValue(->)
    expect(loggedValues).to.deep.equal([[true, 1],[true, "<end>"]])
  it "logs Error events as strings", ->
    loggedValues = []
    console.log = (args...) -> loggedValues.push(args)
    once(new Bacon.Error('err')).doLog(true).onValue(->)
    deferred -> 
      restoreLog()
      expect(loggedValues).to.deep.equal([[true, "<error> err"], [true, '<end>']])
  it "toString", ->
    expect(Bacon.never().doLog().toString()).to.equal("Bacon.never().doLog()")
