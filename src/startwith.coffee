# build-dependencies: scan, concat, once

Bacon.Property :: startWith = (seed) ->
  withDescription(this, "startWith", seed,
    @scan(seed, (prev, next) -> next))

Bacon.EventStream :: startWith = (seed) ->
  withDescription(this, "startWith", seed,
    Bacon.immediately(seed).concat(this))
