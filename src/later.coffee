# build-dependencies: factories
Bacon.later = (delay, value) ->
  withDesc new Bacon.Desc(Bacon, "later", [delay, value]), Bacon.fromBinder (sink) ->
    sender = -> sink [value, endEvent()]
    id = Bacon.scheduler.setTimeout(sender, delay)
    -> Bacon.scheduler.clearTimeout(id)
