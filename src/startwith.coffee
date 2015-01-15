# build-dependencies: scan

Bacon.Property :: startWith = (value) ->
  withDescription(this, "startWith", value,
    @scan(value, (prev, next) -> next))
