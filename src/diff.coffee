# build-dependencies: scan
# build-dependencies: functionconstruction

Bacon.Observable :: diff = (start, f) ->
  f = toCombinator(f)
  withDescription(this, "diff", start, f,
    @scan([start], (prevTuple, next) ->
      [next, f(prevTuple[0], next)])
    .filter((tuple) -> tuple.length == 2)
    .map((tuple) -> tuple[1]))
