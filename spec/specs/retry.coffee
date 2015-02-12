# build-dependencies: skipDuplicates, take

describe "Bacon.retry", ->
  describe "does not retry after value", ->
    expectStreamEvents(
      ->
        calls = 0
        source = ->
          calls += 1
          Bacon.once({calls})
        Bacon.retry({source, retries: 2})
      [calls: 1])
  describe "retries to run the source stream given number of times until it yields a value", ->
    expectStreamEvents(
      ->
        calls = 0
        source = ->
          calls += 1
          if calls < 3
            Bacon.once(new Bacon.Error())
          else
            Bacon.once({calls})
        Bacon.retry({source, retries: 5})
      [calls: 3])
  describe "does not change source stream characteristics", ->
    expectStreamEvents(
      -> Bacon.retry(source: -> fromArray([3, 1, 2, 1, 3]).skipDuplicates().take(2))
      [3, 1])
  describe "retries after retryable error", ->
    expectStreamEvents(
      ->
        calls = 0
        source = ->
          calls += 1
          Bacon.once(new Bacon.Error({calls}))
        isRetryable = ({calls}) ->
          calls < 2
        Bacon.retry({source, isRetryable, retries: 5})
      [error(calls: 2)]) # TODO: assert error content
  describe "yields error when no retries left", ->
    expectStreamEvents(
      ->
        calls = 0
        source = ->
          calls += 1
          Bacon.once(new Bacon.Error({calls}))
        Bacon.retry {source, retries: 2}
      [error(calls: 3)]) # TODO: assert error content
  it "allows specifying delay by context for each retry", (done) ->
    calls = 0
    contexts = []
    source = ->
      calls += 1
      Bacon.once(new Bacon.Error({calls}))
    delay = (context) ->
      contexts.push(context)
      1
    Bacon.retry({source, delay, retries: 2}).onError (err) ->
      expect(contexts).to.deep.equal [
        {error: {calls: 1}, retriesDone: 0}
        {error: {calls: 2}, retriesDone: 1}
      ]
      expect(err).to.deep.equal {calls: 3}
      done()
  it "calls source function after delay", (done) ->
    calls = 0
    source = ->
      calls += 1
      Bacon.once(new Bacon.Error())
    interval = -> 100
    Bacon.retry({source, interval, retries: 1}).onValue -> # noop
    expect(calls).to.equal 1
    done()
  describe "no stack overflows", ->
    expectStreamEvents(
      ->
        source = -> Bacon.once(new Bacon.Error())
        interval = -> 1
        Bacon.retry({source, interval, retries: 1000})
      [error()])
  it "throws exception if 'source' option is not a function", ->
    expect(-> Bacon.retry(source: "ugh")).to.throw "'source' option has to be a function"
  it "toString", ->
    expect(Bacon.retry({source: -> Bacon.once(1)}).toString()).to.equals("Bacon.retry({source:function})")
