Bacon.scheduler = {
  setTimeout: (f,d) -> setTimeout(f,d)
  setInterval: (f, i) -> setInterval(f, i)
  clearInterval: (id) -> clearInterval(id)
  clearTimeout: (id) -> clearTimeout(id)
  asap: (f) -> @setTimeout(f, 0)
  now: -> new Date().getTime()
}
