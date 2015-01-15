# build-dependencies: scheduler
# build-dependencies: eventstream, property

Bacon.EventStream :: bufferWithTime = (delay) ->
  withDescription(this, "bufferWithTime", delay, @bufferWithTimeOrCount(delay, Number.MAX_VALUE))

Bacon.EventStream :: bufferWithCount = (count) ->
  withDescription(this, "bufferWithCount", count, @bufferWithTimeOrCount(undefined, count))

Bacon.EventStream :: bufferWithTimeOrCount = (delay, count) ->
  flushOrSchedule = (buffer) ->
    if buffer.values.length == count
      buffer.flush()
    else if (delay != undefined)
      buffer.schedule()
  withDescription(this, "bufferWithTimeOrCount", delay, count, @buffer(delay, flushOrSchedule, flushOrSchedule))

Bacon.EventStream :: buffer = (delay, onInput = nop, onFlush = nop) ->
  buffer = {
    scheduled: false
    end: undefined
    values: []
    flush: ->
      @scheduled = false
      if @values.length > 0
        reply = @push nextEvent(@values)
        @values = []
        if @end?
          @push @end
        else if reply != Bacon.noMore
          onFlush(this)
      else
        @push @end if @end?
    schedule: ->
      unless @scheduled
        @scheduled = true
        delay(=> @flush())
  }
  reply = Bacon.more
  unless _.isFunction(delay)
    delayMs = delay
    delay = (f) -> Bacon.scheduler.setTimeout(f, delayMs)
  withDescription(this, "buffer", @withHandler (event) ->
    buffer.push = (event) => @push(event)
    if event.isError()
      reply = @push event
    else if event.isEnd()
      buffer.end = event
      unless buffer.scheduled
        buffer.flush()
    else
      buffer.values.push(event.value())
      onInput(buffer)
    reply)


