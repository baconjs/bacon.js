# build-dependencies: observable

Bacon.Observable :: skipErrors = ->
  withDescription(this, "skipErrors", @withHandler (event) ->
    if event.isError()
      Bacon.more
    else
      @push event)
