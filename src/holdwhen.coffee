# build-dependencies: core, flatmap, merge, takeuntil, scan, take

Bacon.EventStream :: holdWhen = (valve) ->
  valve_ = valve.startWith(false)
  releaseHold = valve_.filter (x) -> !x
  putToHold = valve_.filter _.id

  withDescription(this, "holdWhen", valve,
    # the filter(false) thing is added just to keep the subscription active all the time (improves stability with some streams)
    @filter(false).merge valve_.flatMapConcat (shouldHold) =>
      unless shouldHold
        @takeUntil(putToHold)
      else
        @scan([], ((xs,x) -> xs.concat(x))).sampledBy(releaseHold).take(1).flatMap(Bacon.fromArray))
