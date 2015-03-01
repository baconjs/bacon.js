# build-dependencies: core, source
# build-dependencies: functionconstruction
# build-dependencies: when, map

Bacon.EventStream :: sampledBy = (sampler, combinator) ->
  withDescription(this, "sampledBy", sampler, combinator,
    @toProperty().sampledBy(sampler, combinator))

Bacon.Property :: sampledBy = (sampler, combinator_) ->
  combinator = if combinator_?
    toCombinator(combinator_)
  else
    _.id
  thisSource = new Source(this, false)
  samplerSource = new Source(sampler, true)
  stream = Bacon.when([thisSource, samplerSource], combinator)
  result = if sampler instanceof Property then stream.toProperty() else stream
  withDescription(this, "sampledBy", sampler, combinator, result)

Bacon.Property :: sample = (interval) ->
  withDescription(this, "sample", interval,
    @sampledBy Bacon.interval(interval, {}))

Bacon.Observable :: map = (p, args...) ->
  if (p instanceof Property)
    p.sampledBy(this, former)
  else
    convertArgsToFunction this, p, args, (f) ->
      withDescription(this, "map", f, @withHandler (event) ->
        @push event.fmap(f))
