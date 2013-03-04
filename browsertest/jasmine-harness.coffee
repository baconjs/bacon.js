expose = (obj) -> window[key] = obj[key] for key of obj

# attach jasmine to window
expose require '../lib/jasmine.js' unless jasmine?

html = require '../lib/jasmine-html.js'
tap = require '../lib/jasmine.tap_reporter.js'
sinon = require 'sinon'
require '../lib/jquery.js'

# expose helpers
expose require '../spec/SpecHelper'
expose require '../spec/Mock'

# insert test files here
require '../spec/BaconSpec'
require '../spec/PromiseSpec'

# or write test here
elemName = (event) ->
  event.target.localName

describe 'asEventStream', ->
  it 'supports simple format', ->
    mock = sinon.spy()
    $('body').asEventStream('click').map(elemName).take(1).onValue(mock)
    $('body').click()
    expect(mock.callCount).toEqual(1)
    expect(mock.firstCall.args[0]).toEqual('body')
  it 'supports jQuery live selector format', ->
    mock = sinon.spy()
    $('html').asEventStream('click', 'body').map(elemName).take(1).onValue(mock)
    $('body').click()
    expect(mock.callCount).toEqual(1)
    expect(mock.firstCall.args[0]).toEqual('body')
  it 'supports optional eventTransformer, with jQuery live selector', ->
    mock = sinon.spy()
    $('html').asEventStream('click', 'body', elemName).take(1).onValue(mock)
    $('body').click()
    expect(mock.callCount).toEqual(1)
    expect(mock.firstCall.args[0]).toEqual('body')
  it 'supports optional eventTransformer, without jQuery live selector', ->
    mock = sinon.spy()
    $('body').asEventStream('click', elemName).take(1).onValue(mock)
    $('body').click()
    expect(mock.callCount).toEqual(1)
    expect(mock.firstCall.args[0]).toEqual('body')

startJasmine = ->
  env = jasmine.getEnv()
  env.addReporter new jasmine.TapReporter()
  env.addReporter new jasmine.HtmlReporter()
  env.execute()

currentWindowOnload = window.onload

window.onload = ->
  currentWindowOnload() if currentWindowOnload?
  setTimeout startJasmine, 1
