Bacon.later = (delay, value) ->
  withDescription Bacon, "later", delay, value, Bacon.fromBinder (sink) ->
    sender = -> sink [value, endEvent()]
    id = Bacon.scheduler.setTimeout(sender, delay)
    -> Bacon.scheduler.clearTimeout(id)
