# build-dependencies: flatmaplatest, delay, once
# build-dependencies: concat, filter

Bacon.EventStream :: debounce = (delay) ->
  withDesc(new Bacon.Desc(this, "debounce", [delay]), @flatMapLatest (value) ->
    Bacon.later delay, value)

Bacon.Property :: debounce = (delay) -> @delayChanges(new Bacon.Desc(this, "debounce", [delay]), (changes) -> changes.debounce(delay))

Bacon.EventStream :: debounceImmediate = (delay) ->
  withDesc(new Bacon.Desc(this, "debounceImmediate", [delay]), @flatMapFirst (value) ->
    Bacon.once(value).concat(Bacon.later(delay).filter(false)))
