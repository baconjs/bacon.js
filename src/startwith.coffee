# build-dependencies: scan, concat, once

Bacon.Property :: startWith = (seed) ->
  withDesc(new Bacon.Desc(this, "startWith", [seed]),
    @scan(seed, (prev, next) -> next))

Bacon.EventStream :: startWith = (seed) ->
  withDesc(new Bacon.Desc(this, "startWith", [seed]),
    Bacon.once(seed).concat(this))
