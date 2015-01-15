class Some
  constructor: (@value) ->
  getOrElse: -> @value
  get: -> @value
  filter: (f) ->
    if f @value
      new Some(@value)
    else
      None
  map: (f) ->
    new Some(f @value)
  forEach: (f) ->
    f @value
  isDefined: true
  toArray: -> [@value]
  inspect: -> "Some(" + @value + ")"
  toString: -> @inspect()

None = {
  getOrElse: (value) -> value
  filter: -> None
  map: -> None
  forEach: ->
  isDefined: false
  toArray: -> []
  inspect: -> "None"
  toString: -> @inspect()
}

toOption = (v) ->
  if v instanceof Some or v == None
    v
  else
    new Some(v)
