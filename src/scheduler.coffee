Bacon.scheduler = {
  setTimeout: (f,d) -> setTimeout(f,d)
  setInterval: (f, i) -> setInterval(f, i)
  clearInterval: (id) -> clearInterval(id)
  now: -> new Date().getTime()
}
