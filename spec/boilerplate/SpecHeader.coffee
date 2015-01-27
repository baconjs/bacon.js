expect = require("chai").expect
Bacon = require("../dist/Bacon").Bacon
Mocks = require( "./Mock")
TickScheduler = require("./TickScheduler").TickScheduler
mock = Mocks.mock
mockFunction = Mocks.mockFunction
EventEmitter = require("events").EventEmitter
th = require("./SpecHelper")
t = th.t
expectStreamEvents = th.expectStreamEvents
expectPropertyEvents = th.expectPropertyEvents
verifyCleanup = th.verifyCleanup
error = th.error
soon = th.soon
series = th.series
repeat = th.repeat
toValues = th.toValues
sc = TickScheduler()
Bacon.scheduler = sc
# Some streams are unstable when testing with verifySwitching2.
# Generally, all flatMap-based streams are unstable because flatMap discards
# child streams on unsubscribe.
unstable = {unstable:true}
expectError = (errorText, f) ->
  expect(f).to.throw(Error, errorText)

endlessly = (values...) ->
  index = 0
  Bacon.fromSynchronousGenerator -> new Bacon.Next(-> values[index++ % values.length])

lessThan = (limit) ->
  (x) -> x < limit
times = (x, y) -> x * y
add = (x, y) -> x + y
id = (x) -> x
activate = (obs) -> 
  obs.onValue(->)
  obs

