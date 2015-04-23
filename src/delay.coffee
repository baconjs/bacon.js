# build-dependencies: later
# build-dependencies: flatmap
# build-dependencies: delaychanges

Bacon.EventStream :: delay = (delay) ->
  withDescription(this, "delay", delay, @flatMap (value) ->
    Bacon.later delay, value)

Bacon.Property :: delay = (delay) -> @delayChanges("delay", delay, (changes) -> changes.delay(delay))
