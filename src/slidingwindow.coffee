# build-dependencies: scan, filter

Bacon.Observable :: slidingWindow = (n, minValues = 0) ->
  withDescription(this, "slidingWindow", n, minValues, @scan([], ((window, value) -> window.concat([value]).slice(-n)))
    .filter(((values) -> values.length >= minValues)))
