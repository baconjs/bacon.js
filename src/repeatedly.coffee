# build-dependencies: frompoll

Bacon.repeatedly = (delay, values) ->
  index = 0
  withDesc(new Bacon.Desc(Bacon, "repeatedly", [delay, values]), Bacon.fromPoll(delay, -> values[index++ % values.length]))

