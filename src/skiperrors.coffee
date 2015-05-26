# build-dependencies: observable

Bacon.Observable :: skipErrors = ->
  withDesc(new Bacon.Desc(this, "skipErrors", []), @withHandler (event) ->
    if event.isError()
      Bacon.more
    else
      @push event)
