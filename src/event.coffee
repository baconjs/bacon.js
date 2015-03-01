# build-dependencies: _

eventIdCounter = 0

class Event
  constructor: ->
    @id = (++eventIdCounter)
  isEvent: -> true
  isEnd: -> false
  isInitial: -> false
  isNext: -> false
  isError: -> false
  hasValue: -> false
  filter: -> true
  inspect: -> @toString()
  log: -> @toString()

class Next extends Event
  constructor: (value) ->
    super()
    @valueInternal = value
  isNext: -> true
  hasValue: -> true
  value: -> @valueInternal
  fmap: (f) -> @apply(f(@valueInternal))
  apply: (value) -> new Next(value)
  filter: (f) -> f(@valueInternal)
  toString: -> _.toString(@valueInternal)
  log: -> @value()

class Initial extends Next
  isInitial: -> true
  isNext: -> false
  apply: (value) -> new Initial(value)
  toNext: -> new Next(@valueInternal)

class End extends Event
  isEnd: -> true
  fmap: -> this
  apply: -> this
  toString: -> "<end>"

class Error extends Event
  constructor: (@error) ->
  isError: -> true
  fmap: -> this
  apply: -> this
  toString: ->
    "<error> " + _.toString(@error)

Bacon.Event = Event
Bacon.Initial = Initial
Bacon.Next = Next
Bacon.End = End
Bacon.Error = Error

initialEvent = (value) -> new Initial(value)
nextEvent = (value) -> new Next(value)
endEvent = -> new End()
# instanceof more performant than x.?isEvent?()
toEvent = (x) -> if x instanceof Event then x else nextEvent x
