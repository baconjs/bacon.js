# build-dependencies: flatmaplatest, flatmap
# build-dependencies: addpropertyinitialvaluetostream
# build-dependencies: scheduler

Bacon.fromPoll = (delay, poll) ->
  withDescription(Bacon, "fromPoll", delay, poll,
  (Bacon.fromBinder(((handler) ->
    id = Bacon.scheduler.setInterval(handler, delay)
    -> Bacon.scheduler.clearInterval(id)), poll)))

Bacon.later = (delay, value) ->
  withDescription(Bacon, "later", delay, value, Bacon.sequentially(delay, [value]))

Bacon.sequentially = (delay, values) ->
  index = 0
  withDescription(Bacon, "sequentially", delay, values, Bacon.fromPoll delay, ->
    value = values[index++]
    if index < values.length
      value
    else if index == values.length
      [value, endEvent()]
    else
      endEvent())

Bacon.repeatedly = (delay, values) ->
  index = 0
  withDescription(Bacon, "repeatedly", delay, values, Bacon.fromPoll(delay, -> values[index++ % values.length]))

Bacon.interval = (delay, value) ->
  value = {} unless value?
  withDescription(Bacon, "interval", delay, value, Bacon.fromPoll(delay, -> nextEvent(value)))

Bacon.EventStream :: delay = (delay) ->
  withDescription(this, "delay", delay, @flatMap (value) ->
    Bacon.later delay, value)

Bacon.Property :: delay = (delay) -> @delayChanges("delay", delay, (changes) -> changes.delay(delay))

Bacon.Property :: delayChanges = (desc..., f) ->
  withDescription(this, desc...,
    addPropertyInitValueToStream(this, f(@changes())))
