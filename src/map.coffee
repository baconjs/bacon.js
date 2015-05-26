# build-dependencies: observable
# build-dependencies: functionconstruction

Bacon.Observable :: map = (p, args...) ->
  convertArgsToFunction this, p, args, (f) ->
    withDesc(new Bacon.Desc(this, "map", [f]), @withHandler (event) ->
      @push event.fmap(f))
