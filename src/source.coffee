# build-dependencies: _

class Source
  constructor: (@obs, @sync, @lazy = false) ->
    @queue = []
  subscribe: (sink) -> @obs.dispatcher.subscribe(sink)
  toString: -> @obs.toString()
  markEnded: -> @ended = true
  consume: ->
    if @lazy
      { value: _.always(@queue[0]) }
    else
      @queue[0]
  push: (x) -> @queue = [x]
  mayHave: -> true
  hasAtLeast: -> @queue.length
  flatten: true

class ConsumingSource extends Source
  consume: -> @queue.shift()
  push: (x) -> @queue.push(x)
  mayHave: (c) -> !@ended or @queue.length >= c
  hasAtLeast: (c) -> @queue.length >= c
  flatten: false

class BufferingSource extends Source
  constructor: (obs) ->
    super(obs, true)
  consume: ->
    values = @queue
    @queue = []
    {value: -> values}
  push: (x) -> @queue.push(x.value())
  hasAtLeast: -> true

Source.isTrigger = (s) ->
  if s instanceof Source
    s.sync
  else
    s instanceof EventStream

Source.fromObservable = (s) ->
  if s instanceof Source
    s
  else if s instanceof Property
    new Source(s, false)
  else
    new ConsumingSource(s, true)
