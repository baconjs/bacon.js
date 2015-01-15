# build-dependencies: observable

Bacon.Observable :: log = (args...) ->
  @subscribe (event) -> console?.log?(args..., event.log())
  this
