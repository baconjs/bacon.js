# build-dependencies: scheduler, frombinder

Bacon.fromPoll = (delay, poll) ->
  withDesc(new Bacon.Desc(Bacon, "fromPoll", [delay, poll]),
  (Bacon.fromBinder(((handler) ->
    id = Bacon.scheduler.setInterval(handler, delay)
    -> Bacon.scheduler.clearInterval(id)), poll)))
