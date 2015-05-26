# build-dependencies: core, source
# build-dependencies: functionconstruction
# build-dependencies: when, map

Bacon.EventStream :: sampledBy = (sampler, combinator) ->
  withDesc(new Bacon.Desc(this, "sampledBy", [sampler, combinator]),
    @toProperty().sampledBy(sampler, combinator))

Bacon.Property :: sampledBy = (sampler, combinator) ->
  if combinator?
    combinator = toCombinator combinator
  else
    lazy = true
    combinator = (f) -> f.value()
  thisSource = new Source(this, false, lazy)
  samplerSource = new Source(sampler, true, lazy)
  stream = Bacon.when([thisSource, samplerSource], combinator)
  result = if sampler instanceof Property then stream.toProperty() else stream
  withDesc(new Bacon.Desc(this, "sampledBy", [sampler, combinator]), result)

Bacon.Property :: sample = (interval) ->
  withDesc(new Bacon.Desc(this, "sample", [interval]),
    @sampledBy Bacon.interval(interval, {}))

Bacon.Observable :: map = (p, args...) ->
  if (p instanceof Property)
    p.sampledBy(this, former)
  else
    convertArgsToFunction this, p, args, (f) ->
      withDesc(new Bacon.Desc(this, "map", [f]), @withHandler (event) ->
        @push event.fmap(f))
