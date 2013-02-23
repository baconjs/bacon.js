expose = (obj) -> window[key] = obj[key] for key of obj

# attach jasmine to window
expose require('./spec/lib/jasmine.js')

html = require './spec/lib/jasmine-html.js'
tap = require './spec/lib/jasmine.tap_reporter.js'

# expose helpers
expose require('./spec/SpecHelper')
expose require('./spec/Mock')

# insert test files here
require('./spec/BaconSpec')
require('./spec/PromiseSpec')

# or write test here
describe 'Basic Suite', ->
  it 'Should pass a basic truthiness test.', ->
    expect(true).toEqual(true)
    expect(false).toEqual(false)

startJasmine = ->
  jasmine.getEnv().addReporter new jasmine.TapReporter()
  jasmine.getEnv().execute()

currentWindowOnload = window.onload

window.onload = ->
  currentWindowOnload() if currentWindowOnload?
  setTimeout startJasmine, 1
