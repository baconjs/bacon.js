# build-dependencies: scheduler
# build-dependencies: eventstream, property

Bacon.EventStream :: bufferWithTime = (delay) ->
  withDesc(new Bacon.Desc(this, "bufferWithTime", [delay]), @bufferWithTimeOrCount(delay, Number.MAX_VALUE))

Bacon.EventStream :: bufferWithCount = (count) ->
  withDesc(new Bacon.Desc(this, "bufferWithCount", [count]), @bufferWithTimeOrCount(undefined, count))

Bacon.EventStream :: bufferWithTimeOrCount = (delay, count) ->
  flushOrSchedule = (buffer) ->
    if buffer.values.length == count
      #console.log Bacon.scheduler.now() + ": count-flush"
      buffer.flush()
    else if (delay != undefined)
      buffer.schedule()
  withDesc(new Bacon.Desc(this, "bufferWithTimeOrCount", [delay, count]), @buffer(delay, flushOrSchedule, flushOrSchedule))

Bacon.EventStream :: buffer = (delay, onInput = nop, onFlush = nop) ->
  buffer = {
    scheduled: null
    end: undefined
    values: []
    flush: ->
      if @scheduled
        Bacon.scheduler.clearTimeout(@scheduled)
        @scheduled = null
      if @values.length > 0
        #console.log Bacon.scheduler.now() + ": flush " + @values
        valuesToPush = @values
        @values = []
        reply = @push nextEvent(valuesToPush)
        if @end?
          @push @end
        else if reply != Bacon.noMore
          onFlush(this)
      else
        @push @end if @end?
    schedule: ->
      unless @scheduled
        @scheduled = delay =>
          #console.log Bacon.scheduler.now() + ": scheduled flush"
          @flush()
  }
  reply = Bacon.more
  unless _.isFunction(delay)
    delayMs = delay
    delay = (f) ->
      #console.log Bacon.scheduler.now() + ": schedule for " + (Bacon.scheduler.now() + delayMs)
      Bacon.scheduler.setTimeout(f, delayMs)
  withDesc(new Bacon.Desc(this, "buffer", []), @withHandler (event) ->
    buffer.push = (event) => @push(event)
    if event.isError()
      reply = @push event
    else if event.isEnd()
      buffer.end = event
      unless buffer.scheduled
        #console.log Bacon.scheduler.now() + ": end-flush"
        buffer.flush()
    else
      buffer.values.push(event.value())
      #console.log Bacon.scheduler.now() + ": input " + event.value()
      onInput(buffer)
    reply)


