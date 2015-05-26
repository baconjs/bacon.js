# build-dependencies: later
# build-dependencies: flatmap
# build-dependencies: delaychanges

Bacon.EventStream :: delay = (delay) ->
  withDesc(new Bacon.Desc(this, "delay", [delay]), @flatMap (value) ->
    Bacon.later delay, value)

Bacon.Property :: delay = (delay) -> @delayChanges(new Bacon.Desc(this, "delay", [delay]), (changes) -> changes.delay(delay))
