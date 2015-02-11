# build-dependencies: buffer, scheduled, map

Bacon.EventStream :: throttle = (delay) ->
  withDescription(this, "throttle", delay, @bufferWithTime(delay).map((values) -> values[values.length - 1]))

Bacon.Property :: throttle = (delay) -> @delayChanges("throttle", delay, (changes) -> changes.throttle(delay))
