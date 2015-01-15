Bacon.spy = (spy) -> spys.push(spy)

spys = []
registerObs = (obs) ->
  if spys.length
    unless registerObs.running
      try
        registerObs.running = true
        for spy in spys
          spy(obs)
      finally
        delete registerObs.running
  undefined
