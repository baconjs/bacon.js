Bacon = (require "../src/Bacon").Bacon
_ = Bacon._

exports.TickScheduler = ->
  counter = 1
  currentTick = 0
  schedule = {}
  toRemove = []
  nextId = -> counter++
  running = false

  add = (delay, entry) ->
    tick = currentTick + delay
    entry.id = nextId() if not entry.id
    schedule[tick] = [] if not schedule[tick]
    schedule[tick].push entry
    entry.id
  boot = (id) ->
    if not running
      running = true
      setTimeout run, 0
    id
  run = ->
    while Object.keys(schedule).length
      while schedule[currentTick]?.length
        forNow = schedule[currentTick].splice(0)
        for entry in forNow
          if _.contains(toRemove, entry.id)
            _.remove(entry.id, toRemove)
          else
            try
              entry.fn()
            catch e
              throw e unless e == "testing"
            add entry.recur, entry if entry.recur
      delete schedule[currentTick]
      currentTick++
    running = false
  {
    setTimeout: (fn, delay) -> boot(add delay, { fn })
    setInterval: (fn, recur) -> boot(add recur, { fn, recur })
    clearTimeout: (id) -> toRemove.push(id)
    clearInterval: (id) -> toRemove.push(id)
    now: -> currentTick
  }
