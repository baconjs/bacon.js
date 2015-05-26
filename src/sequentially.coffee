# build-dependencies: frompoll

Bacon.sequentially = (delay, values) ->
  index = 0
  withDesc(new Bacon.Desc(Bacon, "sequentially", [delay, values]), Bacon.fromPoll delay, ->
    value = values[index++]
    if index < values.length
      value
    else if index == values.length
      [value, endEvent()]
    else
      endEvent())

