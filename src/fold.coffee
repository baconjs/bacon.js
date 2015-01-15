# build-dependencies: sample

Bacon.Observable :: fold = (seed, f) ->
  withDescription(this, "fold", seed, f, @scan(seed, f).sampledBy(@filter(false).mapEnd().toProperty()))
