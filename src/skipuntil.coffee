# build-dependencies: core, take, map, sample

Bacon.EventStream :: skipUntil = (starter) ->
  started = starter.take(1).map(true).toProperty(false)
  withDesc(new Bacon.Desc(this, "skipUntil", [starter]), @filter(started))

