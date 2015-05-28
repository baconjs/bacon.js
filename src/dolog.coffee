# build-dependencies: observable

Bacon.Observable :: doLog = (args...) ->
  withDesc(new Bacon.Desc(this, "doLog", args), @withHandler (event) ->
    console?.log?(args..., event.log())
    @push event
  )
