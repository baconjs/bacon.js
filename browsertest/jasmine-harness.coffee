expose = (obj) -> window[key] = obj[key] for key of obj

# attach jasmine to window
expose require('../spec/lib/jasmine.js') unless jasmine?

html = require '../spec/lib/jasmine-html.js'
tap = require '../spec/lib/jasmine.tap_reporter.js'

# expose helpers
expose require('../spec/SpecHelper')
expose require('../spec/Mock')

# insert test files here
require('../spec/BaconSpec')
require('../spec/PromiseSpec')

# or write test here
describe 'Basic Suite', ->
  it 'Should pass a basic truthiness test.', ->
    expect(true).toEqual(true)
    expect(false).toEqual(false)

startJasmine = ->
  env = jasmine.getEnv()
  env.addReporter new jasmine.TapReporter()
  env.addReporter new jasmine.HtmlReporter()
  env.execute()

currentWindowOnload = window.onload

window.onload = ->
  currentWindowOnload() if currentWindowOnload?
  setTimeout startJasmine, 1
