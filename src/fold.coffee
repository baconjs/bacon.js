# build-dependencies: sample, scan

Bacon.Observable :: fold = (seed, f) ->
  withDescription(this, "fold", seed, f, @scan(seed, f).sampledBy(@filter(false).mapEnd().toProperty()))
