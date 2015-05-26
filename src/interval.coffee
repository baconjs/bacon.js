# build-dependencies: frompoll

Bacon.interval = (delay, value) ->
  value = {} unless value?
  withDesc(new Bacon.Desc(Bacon, "interval", [delay, value]), Bacon.fromPoll(delay, -> nextEvent(value)))

