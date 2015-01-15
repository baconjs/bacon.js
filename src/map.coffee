# build-dependencies: observable
# build-dependencies: functionconstruction

Bacon.Observable :: map = (p, args...) ->
  convertArgsToFunction this, p, args, (f) ->
    withDescription(this, "map", f, @withHandler (event) ->
      @push event.fmap(f))
