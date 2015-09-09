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
  constructor: (valueF, eager) ->
    if this not instanceof Next
      return new Next(valueF, eager)
    super()
    if !eager && _.isFunction(valueF) || valueF instanceof Next
      @valueF = valueF
      @valueInternal = undefined
    else
      @valueF = undefined
      @valueInternal = valueF
  isNext: -> true
  hasValue: -> true
  value: ->
    if @valueF instanceof Next
      @valueInternal = @valueF.value()
      @valueF = undefined
    else if @valueF
      @valueInternal = @valueF()
      @valueF = undefined
    @valueInternal
  fmap: (f) ->
    if @valueInternal
      value = @valueInternal
      @apply(-> f(value))
    else
      event = this
      @apply(-> f(event.value()))
  apply: (value) -> new Next(value)
  filter: (f) -> f(@value())
  toString: -> _.toString(@value())
  log: -> @value()

class Initial extends Next
  constructor: (valueF, eager) ->
    if this not instanceof Initial
      return new Initial(valueF, eager)
    super(valueF, eager)
  isInitial: -> true
  isNext: -> false
  apply: (value) -> new Initial(value)
  toNext: -> new Next(this)

class End extends Event
  constructor: ->
    if this not instanceof End
      return new End
  isEnd: -> true
  fmap: -> this
  apply: -> this
  toString: -> "<end>"

class Error extends Event
  constructor: (error) ->
    if this not instanceof Error
      return new Error(error)
    @error = error
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

initialEvent = (value) -> new Initial(value, true)
nextEvent = (value) -> new Next(value, true)
endEvent = -> new End()
# instanceof more performant than x.?isEvent?()
toEvent = (x) -> if x instanceof Event then x else nextEvent x
