# build-dependencies: observable, property, eventstream
# build-dependencies: functionconstruction

Bacon.Observable :: filter = (f, args...) ->
  convertArgsToFunction this, f, args, (f) ->
    withDescription(this, "filter", f, @withHandler (event) ->
      if event.filter(f)
        @push event
      else
        Bacon.more)


