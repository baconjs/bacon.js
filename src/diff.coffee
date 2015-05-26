# build-dependencies: scan, filter, map
# build-dependencies: functionconstruction

Bacon.Observable :: diff = (start, f) ->
  f = toCombinator(f)
  withDesc(new Bacon.Desc(this, "diff", [start, f]),
    @scan([start], (prevTuple, next) ->
      [next, f(prevTuple[0], next)])
    .filter((tuple) -> tuple.length == 2)
    .map((tuple) -> tuple[1]))
