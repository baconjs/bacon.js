import { Desc } from "./describe";
import { EventSink, EventStreamDelay, Sink, Subscribe, Unsub, VoidSink, Function1, Function2, Function0 } from "./types";
import { StateF } from "./withstatemachine";
import { Equals } from "./skipduplicates";
import { Accumulator } from "./scan";
import { SpawnerOrObservable, EventSpawner, EventOrValue } from "./flatmap_";
import { DelayFunction } from "./buffer";
import { Transformer } from "./transform";
import { Predicate, PredicateOrProperty } from "./predicate";
import { GroupTransformer } from "./groupby";
import { Differ } from "./diff";
import { DecodedValueOf } from "./decode";
/**
 Observable is the base class for [EventsStream](eventstream.html) and [Property](property.html)

 @typeparam V   Type of the elements/values in the stream/property
 */
export declare abstract class Observable<V> {
    /**
     * Contains a structured version of what [`toString`](#tostring) returns.
     The structured description is an object that contains the fields `context`, `method` and `args`.
     For example, for `Bacon.fromArray([1,2,3]).desc` you'd get
  
     { context: "Bacon", method: "fromArray", args: [[1,2,3]] }
     */
    desc: Desc;
    /**
     * Unique numeric id of this Observable. Implemented using a simple counter starting from 1.
     */
    id: number;
    /** @hidden */
    initialDesc: Desc;
    /** @hidden */
    _name?: string;
    /** @hidden */
    _isObservable: boolean;
    constructor(desc: Desc);
    /**
  Creates a Property that indicates whether
  `observable` is awaiting `otherObservable`, i.e. has produced a value after the latest
  value from `otherObservable`. This is handy for keeping track whether we are
  currently awaiting an AJAX response:
  
  ```js
  var showAjaxIndicator = ajaxRequest.awaiting(ajaxResponse)
  ```
  
     */
    awaiting(other: Observable<any>): Property<boolean>;
    /**
  Throttles the observable using a buffer so that at most one value event in minimumInterval is issued.
  Unlike [`throttle`](#observable-throttle), it doesn't discard the excessive events but buffers them instead, outputting
  them with a rate of at most one value per minimumInterval.
  
  Example:
  
  ```js
  var throttled = source.bufferingThrottle(2)
  ```
  
  ```
  source:    asdf----asdf----
  throttled: a-s-d-f-a-s-d-f-
  ```
     */
    bufferingThrottle(minimumInterval: number): this;
    /**
     * Creates a stream of changes to the Property. The stream *does not* include
     an event for the current value of the Property at the time this method was called.
     For EventStreams, this method returns the stream itself.
     */
    abstract changes(): EventStream<V>;
    /**
  Combines the latest values of the two
  streams or properties using a two-arg function. Similarly to [`scan`](#scan), you can use a
  method name instead, so you could do `a.combine(b, ".concat")` for two
  properties with array value. The result is a [Property](property.html).
     */
    combine<V2, R>(right: Observable<V2>, f: Function2<V, V2, R>): Property<R>;
    /**
  Concatenates two streams/properties into one stream/property so that
  it will deliver events from this observable until it ends and then deliver
  events from `other`. This means too that events from `other`,
  occurring before the end of this observable will not be included in the result
  stream/property.
     */
    abstract concat(other: Observable<V>): Observable<V>;
    abstract concat<V2>(other: Observable<V2>): Observable<V | V2>;
    /**
  Throttles stream/property by given amount
  of milliseconds, but so that event is only emitted after the given
  "quiet period". Does not affect emitting the initial value of a [Property](property.html).
  The difference of [`throttle`](#throttle) and [`debounce`](#debounce) is the same as it is in the
  same methods in jQuery.
  
  Example:
  
  ```
  source:             asdf----asdf----
  source.debounce(2): -----f-------f--
  ```
  
     */
    debounce(minimumInterval: number): this;
    /**
  Passes the first event in the
  stream through, but after that, only passes events after a given number
  of milliseconds have passed since previous output.
  
  Example:
  
  ```
  source:                      asdf----asdf----
  source.debounceImmediate(2): a-d-----a-d-----
  ```
     */
    debounceImmediate(minimumInterval: number): this;
    /**
  Decodes input using the given mapping. Is a
  bit like a switch-case or the decode function in Oracle SQL. For
  example, the following would map the value 1 into the string "mike"
  and the value 2 into the value of the `who` property.
  
  ```js
  property.decode({1 : "mike", 2 : who})
  ```
  
  This is actually based on [`combineTemplate`](#combinetemplate) so you can compose static
  and dynamic data quite freely, as in
  
  ```js
  property.decode({1 : { type: "mike" }, 2 : { type: "other", whoThen : who }})
  ```
  
  The return value of [`decode`](#decode) is always a [`Property`](property.html).
  
     */
    decode<T extends Record<any, any>>(cases: T): Property<DecodedValueOf<T>>;
    /**
  Delays the stream/property by given amount of milliseconds. Does not delay the initial value of a [`Property`](property.html).
  
  ```js
  var delayed = source.delay(2)
  ```
  
  ```
  source:    asdf----asdf----
  delayed:   --asdf----asdf--
  ```
  
     */
    delay(delayMs: number): this;
    /** @hidden */
    abstract transformChanges(desc: Desc, f: EventStreamDelay<V>): this;
    /**
     * Returns the an array of dependencies that the Observable has. For instance, for `a.map(function() {}).deps()`, would return `[a]`.
     This method returns the "visible" dependencies only, skipping internal details.  This method is thus suitable for visualization tools.
     Internally, many combinator functions depend on other combinators to create intermediate Observables that the result will actually depend on.
     The `deps` method will skip these internal dependencies. See also: [internalDeps](#internaldeps)
     */
    deps(): Observable<any>[];
    /**
  Returns a Property that represents the result of a comparison
  between the previous and current value of the Observable. For the initial value of the Observable,
  the previous value will be the given start.
  
  Example:
  
  ```js
  var distance = function (a,b) { return Math.abs(b - a) }
  Bacon.sequentially(1, [1,2,3]).diff(0, distance)
  ```
  
  This would result to following elements in the result stream:
  
      1 - 0 = 1
      2 - 1 = 1
      3 - 2 = 1
  
     */
    diff<V2>(start: V, f: Differ<V, V2>): Property<V2>;
    /**
  Returns a stream/property where the function f
  is executed for each value, before dispatching to subscribers. This is
  useful for debugging, but also for stuff like calling the
  `preventDefault()` method for events. In fact, you can
  also use a property-extractor string instead of a function, as in
  `".preventDefault"`.
  
  Please note that for Properties, it's not guaranteed that the function will be called exactly once
  per event; when a Property loses all of its subscribers it will re-emit its current value when a
  new subscriber is added.
     */
    doAction(f: Function1<V, any>): this;
    doEnd(f: Function0<any>): this;
    /**
  Returns a stream/property where the function f
  is executed for each error, before dispatching to subscribers.
  That is, same as [`doAction`](#observable-doaction) but for errors.
     */
    doError(f: Function1<any, any>): this;
    /**
  Logs each value of the Observable to the console. doLog() behaves like [`log`](#log)
  but does not subscribe to the event stream. You can think of doLog() as a
  logger function that – unlike log() – is safe to use in production. doLog() is
  safe, because it does not cause the same surprising side-effects as log()
  does.
     */
    doLog(...args: any[]): this;
    endAsValue(): Observable<{}>;
    /**
    Returns a stream/property that ends the on first [`Error`](error.html) event. The
    error is included in the output of the returned Observable.
    
    @param  predicate   optional predicate function to determine whether to end on a given error
     */
    endOnError(predicate?: Predicate<any>): this;
    /**
  Returns a stream containing [`Error`](error.html) events only.
  Same as filtering with a function that always returns false.
     */
    errors(): this;
    /**
  Filters values using given predicate function.
  Instead of a function, you can use a constant value (`true` to include all, `false` to exclude all).
  
  You can also filter values based on the value of a
  property. Event will be included in output [if and only if](http://en.wikipedia.org/wiki/If_and_only_if) the property holds `true`
  at the time of the event.
     */
    filter(f: Predicate<V> | boolean | Property<boolean>): this;
    /**
  Takes the first element from the stream. Essentially `observable.take(1)`.
     */
    first(): this;
    /**
  Returns a Promise which will be resolved with the first event coming from an Observable.
  Like [`toPromise`](#topromise), the global ES6 promise implementation will be used unless a promise
  constructor is given.
     */
    firstToPromise(PromiseCtr?: Function): Promise<V>;
    /**
  For each element in the source stream, spawn a new
  stream/property using the function `f`. Collect events from each of the spawned
  streams into the result stream/property. Note that instead of a function, you can provide a
  stream/property too. Also, the return value of function `f` can be either an
  `Observable` (stream/property) or a constant value.
  
  `stream.flatMap()` can be used conveniently with [`Bacon.once()`](../globals.html#once) and [`Bacon.never()`](../globals.html#never)
  for converting and filtering at the same time, including only some of the results.
  
  Example - converting strings to integers, skipping empty values:
  
  ```js
  stream.flatMap(function(text) {
      return (text != "") ? parseInt(text) : Bacon.never()
  })
  ```
     */
    abstract flatMap<V2>(f: SpawnerOrObservable<V, V2>): Observable<V2>;
    /**
  A [`flatMapWithConcurrencyLimit`](#flatmapwithconcurrencylimit) with limit of 1.
     */
    abstract flatMapConcat<V2>(f: SpawnerOrObservable<V, V2>): Observable<V2>;
    /**
  Like [`flatMap`](#flatmap), but is applied only on [`Error`](error.html) events. Returned values go into the
  value stream, unless an error event is returned. As an example, one type of error could result in a retry and another just
  passed through, which can be implemented using flatMapError.
     */
    abstract flatMapError<V2>(f: Function1<any, Observable<V2> | EventOrValue<V2>>): Observable<V | V2>;
    abstract flatMapEvent<V2>(f: EventSpawner<V, V2>): Observable<V2>;
    /**
  Like [`flatMap`](#observable-flatmap), but only spawns a new
  stream if the previously spawned stream has ended.
     */
    abstract flatMapFirst<V2>(f: SpawnerOrObservable<V, V2>): Observable<V2>;
    /**
  Like [`flatMap`](#flatmap), but instead of including events from
  all spawned streams, only includes them from the latest spawned stream.
  You can think this as switching from stream to stream.
  Note that instead of a function, you can provide a stream/property too.
     */
    abstract flatMapLatest<V2>(f: SpawnerOrObservable<V, V2>): Observable<V2>;
    /**
  A super method of *flatMap* family. It limits the number of open spawned streams and buffers incoming events.
  [`flatMapConcat`](#flatmapconcat) is `flatMapWithConcurrencyLimit(1)` (only one input active),
  and [`flatMap`](#flatmap) is `flatMapWithConcurrencyLimit ∞` (all inputs are piped to output).
     */
    abstract flatMapWithConcurrencyLimit<V2>(limit: number, f: SpawnerOrObservable<V, V2>): Observable<V2>;
    /**
  Works like [`scan`](#scan) but only emits the final
  value, i.e. the value just before the observable ends. Returns a
  [`Property`](property.html).
     */
    fold<V2>(seed: V2, f: Accumulator<V, V2>): Property<V2>;
    /**
     An alias for [onValue](#onvalue).
  
     Subscribes a given handler function to the observable. Function will be called for each new value (not for errors or stream end).
     */
    forEach(f?: Sink<V>): Unsub;
    /**
  Groups stream events to new streams by `keyF`. Optional `limitF` can be provided to limit grouped
  stream life. Stream transformed by `limitF` is passed on if provided. `limitF` gets grouped stream
  and the original event causing the stream to start as parameters.
  
  Calculator for grouped consecutive values until group is cancelled:
  
  ```
  var events = [
    {id: 1, type: "add", val: 3 },
    {id: 2, type: "add", val: -1 },
    {id: 1, type: "add", val: 2 },
    {id: 2, type: "cancel"},
    {id: 3, type: "add", val: 2 },
    {id: 3, type: "cancel"},
    {id: 1, type: "add", val: 1 },
    {id: 1, type: "add", val: 2 },
    {id: 1, type: "cancel"}
  ]
  
  function keyF(event) {
    return event.id
  }
  
  function limitF(groupedStream, groupStartingEvent) {
    var cancel = groupedStream.filter(function(x) { return x.type === "cancel"}).take(1)
    var adds = groupedStream.filter(function(x) { return x.type === "add" })
    return adds.takeUntil(cancel).map(".val")
  }
  
  Bacon.sequentially(2, events)
    .groupBy(keyF, limitF)
    .flatMap(function(groupedStream) {
      return groupedStream.fold(0, function(acc, x) { return acc + x })
    })
    .onValue(function(sum) {
      console.log(sum)
      // returns [-1, 2, 8] in an order
    })
  ```
  
     */
    abstract groupBy<V2 = V>(keyF: Function1<V, string>, limitF?: GroupTransformer<V, V2>): Observable<EventStream<V2>>;
    /**
  Pauses and buffers the event stream if last event in valve is truthy.
  All buffered events are released when valve becomes falsy.
     */
    holdWhen(valve: Property<boolean>): EventStream<V>;
    inspect(): string;
    /**
     * Returns the true dependencies of the observable, including the intermediate "hidden" Observables.
     This method is for Bacon.js internal purposes but could be useful for debugging/analysis tools as well.
     See also: [deps](#deps)
     */
    internalDeps(): any[];
    /**
  Takes the last element from the stream. None, if stream is empty.
  
  
  *Note:* `neverEndingStream.last()` creates the stream which doesn't produce any events and never ends.
     */
    last(): this;
    /**
  Logs each value of the Observable to the console.
  It optionally takes arguments to pass to console.log() alongside each
  value. To assist with chaining, it returns the original Observable. Note
  that as a side-effect, the observable will have a constant listener and
  will not be garbage-collected. So, use this for debugging only and
  remove from production code. For example:
  
  ```js
  myStream.log("New event in myStream")
  ```
  
  or just
  
  ```js
  myStream.log()
  ```
  
     */
    log(...args: any[]): this;
    /**
  Maps values using given function, returning a new
  stream/property. Instead of a function, you can also provide a [Property](property.html),
  in which case each element in the source stream will be mapped to the current value of
  the given property.
    */
    abstract map<V2>(f: (Function1<V, V2> | Property<V2> | V2)): Observable<V2>;
    /**
  Adds an extra [`Next`](next.html) event just before End. The value is created
  by calling the given function when the source stream ends. Instead of a
  function, a static value can be used.
     */
    mapEnd(f: Function0<V> | V): this;
    /**
  Maps errors using given function. More
  specifically, feeds the "error" field of the error event to the function
  and produces a [`Next`](next.html) event based on the return value.
     */
    mapError(f: Function1<any, V> | V): this;
    /**
  Sets the name of the observable. Overrides the default
  implementation of [`toString`](#tostring) and `inspect`.
  Returns the same observable, with mutated name.
     */
    name(name: string): this;
    /**
  Returns a stream/property that inverts boolean values (using `!`)
     */
    abstract not(): Observable<boolean>;
    /**
  Subscribes a callback to stream end. The function will be called when the stream ends.
  Just like `subscribe`, this method returns a function for unsubscribing.
     */
    onEnd(f?: VoidSink): Unsub;
    /**
  Subscribes a handler to error events. The function will be called for each error in the stream.
  Just like `subscribe`, this method returns a function for unsubscribing.
     */
    onError(f?: Sink<any>): Unsub;
    /**
  Subscribes a given handler function to the observable. Function will be called for each new value.
  This is the simplest way to assign a side-effect to an observable. The difference
  to the `subscribe` method is that the actual stream values are
  received, instead of [`Event`](event) objects.
  Just like `subscribe`, this method returns a function for unsubscribing.
  `stream.onValue` and `property.onValue` behave similarly, except that the latter also
  pushes the initial value of the property, in case there is one.
     */
    onValue(f?: Sink<V>): Unsub;
    /**
  Like [`onValue`](#onvalue), but splits the value (assuming its an array) as function arguments to `f`.
  Only applicable for observables with arrays as values.
     */
    onValues(f: Function): Unsub;
    /** A synonym for [scan](#scan).
     */
    reduce<V2>(seed: V2, f: Accumulator<V, V2>): Property<V2>;
    /**
    Creates an EventStream by sampling this
    stream/property value at each event from the `sampler` stream. The result
    `EventStream` will contain the sampled value at each event in the source
    stream.
  
     @param {Observable<V2>} sampler
     */
    /**
     Creates an EventStream/Property by sampling this
     stream/property value at each event from the `sampler` stream. The result
     will contain the sampled value at each event in the source stream.
  
     @param {Observable<V2>} sampler
     */
    sampledBy(sampler: EventStream<any>): EventStream<V>;
    sampledBy(sampler: Property<any>): Property<V>;
    sampledBy(sampler: Observable<any>): Observable<V>;
    /**
  Scans stream/property with given seed value and
  accumulator function, resulting to a Property. For example, you might
  use zero as seed and a "plus" function as the accumulator to create
  an "integral" property. Instead of a function, you can also supply a
  method name such as ".concat", in which case this method is called on
  the accumulator value and the new stream value is used as argument.
  
  Example:
  
  ```js
  var plus = function (a,b) { return a + b }
  Bacon.sequentially(1, [1,2,3]).scan(0, plus)
  ```
  
  This would result to following elements in the result stream:
  
      seed value = 0
      0 + 1 = 1
      1 + 2 = 3
      3 + 3 = 6
  
  When applied to a Property as in `r = p.scan(seed, f)`, there's a (hopefully insignificant) catch:
  The starting value for `r` depends on whether `p` has an
  initial value when scan is applied. If there's no initial value, this works
  identically to EventStream.scan: the `seed` will be the initial value of
  `r`. However, if `r` already has a current/initial value `x`, the
  seed won't be output as is. Instead, the initial value of `r` will be `f(seed, x)`. This makes sense,
  because there can only be 1 initial value for a Property at a time.
     */
    scan<V2>(seed: V2, f: Accumulator<V, V2>): Property<V2>;
    /**
  Skips the first n elements from the stream
     */
    skip(count: number): this;
    /**
  Drops consecutive equal elements. So,
  from `[1, 2, 2, 1]` you'd get `[1, 2, 1]`. Uses the `===` operator for equality
  checking by default. If the isEqual argument is supplied, checks by calling
  isEqual(oldValue, newValue). For instance, to do a deep comparison,you can
  use the isEqual function from [underscore.js](http://underscorejs.org/)
  like `stream.skipDuplicates(_.isEqual)`.
     */
    skipDuplicates(isEqual?: Equals<V>): this;
    /**
     * Returns a new stream/property which excludes all [Error](error.html) events in the source
     */
    skipErrors(): this;
    /**
     Skips elements from the source, until a value event
     appears in the given `starter` stream/property. In other words, starts delivering values
     from the source after first value appears in `starter`.
     */
    skipUntil(starter: Observable<any>): this;
    /**
     Skips elements until the given predicate function returns falsy once, and then
     lets all events pass through. Instead of a predicate you can also pass in a `Property<boolean>` to skip elements
     while the Property holds a truthy value.
     */
    skipWhile(f: PredicateOrProperty<V>): this;
    /**
  Returns a Property that represents a
  "sliding window" into the history of the values of the Observable. The
  result Property will have a value that is an array containing the last `n`
  values of the original observable, where `n` is at most the value of the
  `max` argument, and at least the value of the `min` argument. If the
  `min` argument is omitted, there's no lower limit of values.
  
  For example, if you have a stream `s` with value a sequence 1 - 2 - 3 - 4 - 5, the
  respective values in `s.slidingWindow(2)` would be [] - [1] - [1,2] -
  [2,3] - [3,4] - [4,5]. The values of `s.slidingWindow(2,2)`would be
  [1,2] - [2,3] - [3,4] - [4,5].
  
     */
    slidingWindow(maxValues: number, minValues?: number): Property<V[]>;
    /**
  Adds a starting value to the stream/property, i.e. concats a
  single-element stream containing the single seed value  with this stream.
     */
    abstract startWith(seed: V): Observable<V>;
    /**
     * subscribes given handler function to event stream. Function will receive [event](event.html) objects
     for all new value, end and error events in the stream.
     The subscribe() call returns a `unsubscribe` function that you can call to unsubscribe.
     You can also unsubscribe by returning [`Bacon.noMore`](../globals.html#nomore) from the handler function as a reply
     to an Event.
     `stream.subscribe` and `property.subscribe` behave similarly, except that the latter also
     pushes the initial value of the property, in case there is one.
  
     * @param {EventSink<V>} sink the handler function
     * @returns {Unsub}
     */
    subscribe(sink?: EventSink<V>): Unsub;
    /** @hidden */
    abstract subscribeInternal(sink: EventSink<V>): Unsub;
    /**
  Takes at most n values from the stream and then ends the stream. If the stream has
  fewer than n values then it is unaffected.
  Equal to [`Bacon.never()`](../globals.html#never) if `n <= 0`.
     */
    take(count: number): this;
    /**
  Takes elements from source until a value event appears in the other stream.
  If other stream ends without value, it is ignored.
     */
    takeUntil(stopper: Observable<any>): this;
    /**
  Takes while given predicate function holds true, and then ends. Alternatively, you can supply a boolean Property to take elements while the Property holds `true`.
     */
    takeWhile(f: PredicateOrProperty<V>): this;
    /**
  Throttles stream/property by given amount
  of milliseconds. Events are emitted with the minimum interval of
  [`delay`](#observable-delay). The implementation is based on [`stream.bufferWithTime`](#stream-bufferwithtime).
  Does not affect emitting the initial value of a [`Property`](#property).
  
  Example:
  
  ```js
  var throttled = source.throttle(2)
  ```
  
  ```
  source:    asdf----asdf----
  throttled: --s--f----s--f--
  ```
     */
    throttle(minimumInterval: number): this;
    abstract toEventStream(): EventStream<V>;
    /**
  Returns a Promise which will be resolved with the last event coming from an Observable.
  The global ES6 promise implementation will be used unless a promise constructor is given.
  Use a shim if you need to support legacy browsers or platforms.
  [caniuse promises](http://caniuse.com/#feat=promises).
  
  See also [firstToPromise](#firsttopromise).
     */
    toPromise(PromiseCtr?: Function): Promise<V>;
    /**
     In case of EventStream, creates a Property based on the EventStream.
  
     In case of Property, returns the Property itself.
     */
    abstract toProperty(): Property<V>;
    /**
     *Returns a textual description of the Observable. For instance, `Bacon.once(1).map(function() {}).toString()` would return "Bacon.once(1).map(function)".
     **/
    toString(): string;
    /**
     * TODO: proper documentation missing
  Lets you do more custom event handling: you
  get all events to your function and you can output any number of events
  and end the stream if you choose. For example, to send an error and end
  the stream in case a value is below zero:
  
  ```js
  if (Bacon.hasValue(event) && event.value < 0) {
    sink(new Bacon.Error("Value below zero"));
    return sink(end());
  } else {
    return sink(event);
  }
  ```
  
  Note that it's important to return the value from `sink` so that
  the connection to the underlying stream will be closed when no more
  events are needed.
     */
    abstract transform<V2>(transformer: Transformer<V, V2>, desc?: Desc): Observable<V2>;
    withDesc(desc?: Desc): this;
    /**
  Sets the structured description of the observable. The [`toString`](#tostring) and `inspect` methods
  use this data recursively to create a string representation for the observable. This method
  is probably useful for Bacon core / library / plugin development only.
  
  For example:
  
      var src = Bacon.once(1)
      var obs = src.map(function(x) { return -x })
      console.log(obs.toString())
      --> Bacon.once(1).map(function)
      obs.withDescription(src, "times", -1)
      console.log(obs.toString())
      --> Bacon.once(1).times(-1)
  
  The method returns the same observable with mutated description.
  
  */
    withDescription(context: any, method: string, ...args: any[]): this;
    /**
     Creates an EventStream/Property by sampling a given `samplee`
     stream/property value at each event from the this stream/property.
  
     @param {Observable<V2>} samplee
     @param f function to select/calculate the result value based on the value in the source stream and the samplee
  
     @typeparam V2  type of values in the samplee
     @typeparam R   type of values in the result
     */
    abstract withLatestFrom<V2, R>(samplee: Observable<V2>, f: Function2<V, V2, R>): Observable<R>;
    /**
  Lets you run a state machine
  on an observable. Give it an initial state object and a state
  transformation function that processes each incoming event and
  returns an array containing the next state and an array of output
  events. Here's an example where we calculate the total sum of all
  numbers in the stream and output the value on stream end:
  
  ```js
  Bacon.fromArray([1,2,3])
    .withStateMachine(0, function(sum, event) {
      if (event.hasValue)
        return [sum + event.value, []]
      else if (event.isEnd)
        return [undefined, [new Bacon.Next(sum), event]]
      else
        return [sum, [event]]
    })
  ```
  @param initState  initial state for the state machine
  @param f          the function that defines the state machine
  @typeparam  State   type of machine state
  @typeparam  Out     type of values to be emitted
     */
    abstract withStateMachine<State, Out>(initState: State, f: StateF<V, State, Out>): Observable<Out>;
    /**
  Returns an EventStream with elements
  pair-wise lined up with events from this and the other EventStream or Property.
  A zipped stream will publish only when it has a value from each
  source and will only produce values up to when any single source ends.
  
  The given function `f` is used to create the result value from value in the two
  sources. If no function is given, the values are zipped into an array.
  
  Be careful not to have too much "drift" between streams. If one stream
  produces many more values than some other excessive buffering will
  occur inside the zipped observable.
  
  Example 1:
  
  ```js
  var x = Bacon.fromArray([1, 2])
  var y = Bacon.fromArray([3, 4])
  x.zip(y, function(x, y) { return x + y })
  
  # produces values 4, 6
  ```
  
  See also [`zipWith`](../globals.html#zipwith) and [`zipAsArray`](../globals.html/zipasarray) for zipping more than 2 sources.
  
     */
    zip<V2, R>(other: Observable<V2>, f: Function2<V, V2, R>): EventStream<R>;
}
/** @hidden */
export declare type ObservableConstructor = (description: Desc, subscribe: Subscribe<any>) => Observable<any>;
/**
 A reactive property. Has the concept of "current value".
 You can create a Property from an EventStream by using either [`toProperty`](eventstream.html#toproperty)
 or [`scan`](eventstream.html#scan) method. Note: depending on how a Property is created, it may or may not
 have an initial value. The current value stays as its last value after the stream has ended.

 Here are the most common ways for creating Properties:

 - Create a constant property with [constant](../globals.html#constant)
 - Create a property based on an EventStream with [toProperty](eventstream.html#toproperty)
 - Scan an EventStream with an accumulator function with [scan](eventstream.html#scan)
 - Create a state property based on multiple sources using [update](../globals.html#update)

 @typeparam V   Type of the elements/values in the stream/property
 */
export declare class Property<V> extends Observable<V> {
    constructor(desc: Desc, subscribe: Subscribe<V>, handler?: EventSink<V>);
    /**
     Combines properties with the `&&` operator. It produces a new value when either of the Properties change,
     combining the latest values using `&&`.
     */
    and(other: Property<any>): Property<boolean>;
    /**
     * creates a stream of changes to the Property. The stream *does not* include
     an event for the current value of the Property at the time this method was called.
     */
    changes(): EventStream<V>;
    /**
     Concatenates this property with another stream/properties into one property so that
     it will deliver events from this property it ends and then deliver
     events from `other`. This means too that events from `other`,
     occurring before the end of this property will not be included in the result
     stream/property.
     */
    concat(other: Observable<V>): Property<V>;
    concat<V2>(other: Observable<V2>): Property<V | V2>;
    /** @hidden */
    transformChanges(desc: Desc, f: EventStreamDelay<V>): this;
    /**
     For each element in the source stream, spawn a new
     stream/property using the function `f`. Collect events from each of the spawned
     streams into the result property. Note that instead of a function, you can provide a
     stream/property too. Also, the return value of function `f` can be either an
     `Observable` (stream/property) or a constant value.
  
     `stream.flatMap()` can be used conveniently with [`Bacon.once()`](../globals.html#once) and [`Bacon.never()`](../globals.html#never)
     for converting and filtering at the same time, including only some of the results.
  
     Example - converting strings to integers, skipping empty values:
  
     ```js
     stream.flatMap(function(text) {
      return (text != "") ? parseInt(text) : Bacon.never()
  })
     ```
     */
    flatMap<V2>(f: SpawnerOrObservable<V, V2>): Property<V2>;
    /**
     A [`flatMapWithConcurrencyLimit`](#flatmapwithconcurrencylimit) with limit of 1.
     */
    flatMapConcat<V2>(f: SpawnerOrObservable<V, V2>): Property<V2>;
    /**
     Like [`flatMap`](#flatmap), but is applied only on [`Error`](error.html) events. Returned values go into the
     value stream, unless an error event is returned. As an example, one type of error could result in a retry and another just
     passed through, which can be implemented using flatMapError.
     */
    flatMapError<V2>(f: Function1<any, Observable<V2> | EventOrValue<V2>>): Property<V | V2>;
    flatMapEvent<V2>(f: EventSpawner<V, V2>): Property<V2>;
    /**
     Like [`flatMap`](#observable-flatmap), but only spawns a new
     stream if the previously spawned stream has ended.
     */
    flatMapFirst<V2>(f: SpawnerOrObservable<V, V2>): Property<V2>;
    /**
     Like [`flatMap`](#flatmap), but instead of including events from
     all spawned streams, only includes them from the latest spawned stream.
     You can think this as switching from stream to stream.
     Note that instead of a function, you can provide a stream/property too.
     */
    flatMapLatest<V2>(f: SpawnerOrObservable<V, V2>): Property<V2>;
    /**
     A super method of *flatMap* family. It limits the number of open spawned streams and buffers incoming events.
     [`flatMapConcat`](#flatmapconcat) is `flatMapWithConcurrencyLimit(1)` (only one input active),
     and [`flatMap`](#flatmap) is `flatMapWithConcurrencyLimit ∞` (all inputs are piped to output).
     */
    flatMapWithConcurrencyLimit<V2>(limit: number, f: SpawnerOrObservable<V, V2>): Property<V2>;
    /**
     Groups stream events to new streams by `keyF`. Optional `limitF` can be provided to limit grouped
     stream life. Stream transformed by `limitF` is passed on if provided. `limitF` gets grouped stream
     and the original event causing the stream to start as parameters.
  
     Calculator for grouped consecutive values until group is cancelled:
  
     ```
     var events = [
     {id: 1, type: "add", val: 3 },
     {id: 2, type: "add", val: -1 },
     {id: 1, type: "add", val: 2 },
     {id: 2, type: "cancel"},
     {id: 3, type: "add", val: 2 },
     {id: 3, type: "cancel"},
     {id: 1, type: "add", val: 1 },
     {id: 1, type: "add", val: 2 },
     {id: 1, type: "cancel"}
     ]
  
     function keyF(event) {
    return event.id
  }
  
     function limitF(groupedStream, groupStartingEvent) {
    var cancel = groupedStream.filter(function(x) { return x.type === "cancel"}).take(1)
    var adds = groupedStream.filter(function(x) { return x.type === "add" })
    return adds.takeUntil(cancel).map(".val")
  }
  
     Bacon.sequentially(2, events)
     .groupBy(keyF, limitF)
     .flatMap(function(groupedStream) {
      return groupedStream.fold(0, function(acc, x) { return acc + x })
    })
     .onValue(function(sum) {
      console.log(sum)
      // returns [-1, 2, 8] in an order
    })
     ```
  
     */
    groupBy<V2 = V>(keyF: Function1<V, string>, limitF?: GroupTransformer<V, V2>): Property<EventStream<V2>>;
    map<V2>(f: Function1<V, V2>): Property<V2>;
    map<V2>(f: Property<V2> | V2): Property<V2>;
    /** Returns a Property that inverts the value of this one (using the `!` operator). **/
    not(): Property<boolean>;
    /**
     Combines properties with the `||` operator. It produces a new value when either of the Properties change,
     combining the latest values using `||`.
     */
    or(other: Property<any>): Property<boolean>;
    /**
     Creates an EventStream by sampling the
     property value at given interval (in milliseconds)
     */
    sample(interval: number): EventStream<V>;
    /**
    Adds an initial "default" value for the
    Property. If the Property doesn't have an initial value of it's own, the
    given value will be used as the initial value. If the property has an
    initial value of its own, the given value will be ignored.
     */
    startWith(seed: V): Property<V>;
    /** @hidden */
    subscribeInternal(sink?: EventSink<V>): Unsub;
    /**
     Creates an EventStream based on this Property. The stream contains also an event for the current
     value of this Property at the time this method was called.
     */
    toEventStream(options?: EventStreamOptions): EventStream<V>;
    /**
     Returns the Property itself.
     */
    toProperty(): Property<V>;
    transform<V2>(transformer: Transformer<V, V2>, desc?: Desc): Property<V2>;
    /**
     Creates an EventStream/Property by sampling a given `samplee`
     stream/property value at each event from the this stream/property.
  
     @param {Observable<V2>} samplee
     @param f function to select/calculate the result value based on the value in the source stream and the samplee
  
     @typeparam V2  type of values in the samplee
     @typeparam R   type of values in the result
     */
    withLatestFrom<V2, R>(samplee: Observable<V2>, f: Function2<V, V2, R>): Property<R>;
    /**
     Lets you run a state machine
     on an observable. Give it an initial state object and a state
     transformation function that processes each incoming event and
     returns an array containing the next state and an array of output
     events. Here's an example where we calculate the total sum of all
     numbers in the stream and output the value on stream end:
  
     ```js
     Bacon.fromArray([1,2,3])
     .withStateMachine(0, function(sum, event) {
      if (event.hasValue)
        return [sum + event.value, []]
      else if (event.isEnd)
        return [undefined, [new Bacon.Next(sum), event]]
      else
        return [sum, [event]]
    })
     ```
     @param initState  initial state for the state machine
     @param f          the function that defines the state machine
     @typeparam  State   type of machine state
     @typeparam  Out     type of values to be emitted
     */
    withStateMachine<State, Out>(initState: State, f: StateF<V, State, Out>): Property<Out>;
}
/** @hidden */
export declare function isProperty<V>(x: any): x is Property<V>;
/** @hidden */
export declare const allowSync: {
    forceAsync: boolean;
};
/** @hidden */
export interface EventStreamOptions {
    forceAsync: boolean;
}
/**
 * EventStream represents a stream of events. It is an Observable object, meaning
 that you can listen to events in the stream using, for instance, the [`onValue`](#onvalue) method
 with a callback.

 To create an EventStream, you'll want to use one of the following factory methods:

  - From DOM EventTarget or Node.JS EventEmitter objects using [fromEvent](../globals.html#fromevent)
  - From a Promise using [fromPromise](../globals.html#frompromise)
  - From an unary callback using [fromCallback](../globals.html#fromcallback)
  - From a Node.js style callback using [fromNodeCallback](../globals.html#fromnodecallback)
  - From RxJs or Kefir observables using [fromESObservable](../globals.html#fromesobservable)
  - By polling a synchronous function using [fromPoll](../globals.html#fromPoll)
  - Emit a single event instantly using [once](../globals.html#once)
  - Emit a single event with a delay [later](../globals.html#later)
  - Emit the same event indefinitely using [interval](../globals.html#interval)
  - Emit an array of events instantly [fromArray](../globals.html#fromarray)
  - Emit an array of events with a delay [sequentially](../globals.html#sequentially)
  - Emit an array of events repeatedly with a delay [repeatedly](../globals.html#repeatedly)
  - Use a generator function to be called repeatedly [repeat](../globals.html#repeat)
  - Create a stream that never emits an event, ending immediately [never](../globals.html#never)
  - Create a stream that never emits an event, ending with a delay [silence](../globals.html#silence)
  - Create stream using a custom binder function [fromBinder](../globals.html#frombinder)
  - Wrap jQuery events using [asEventStream](../globals.html#_)


 @typeparam V   Type of the elements/values in the stream/property

 */
export declare class EventStream<V> extends Observable<V> {
    /** @hidden */
    _isEventStream: boolean;
    constructor(desc: Desc, subscribe: Subscribe<V>, handler?: EventSink<V>, options?: EventStreamOptions);
    /**
     Buffers stream events with given delay.
     The buffer is flushed at most once in the given interval. So, if your input
     contains [1,2,3,4,5,6,7], then you might get two events containing [1,2,3,4]
     and [5,6,7] respectively, given that the flush occurs between numbers 4 and 5.
  
     Also works with a given "defer-function" instead
     of a delay. Here's a simple example, which is equivalent to
     stream.bufferWithTime(10):
  
     ```js
     stream.bufferWithTime(function(f) { setTimeout(f, 10) })
     ```
  
     * @param delay buffer duration in milliseconds
     */
    bufferWithTime(delay: number | DelayFunction): EventStream<V[]>;
    /**
     Buffers stream events with given count.
     The buffer is flushed when it contains the given number of elements or the source stream ends.
  
     So, if you buffer a stream of `[1, 2, 3, 4, 5]` with count `2`, you'll get output
     events with values `[1, 2]`, `[3, 4]` and `[5]`.
  
     * @param {number} count
     */
    bufferWithCount(count: number): EventStream<V[]>;
    /**
     Buffers stream events and
     flushes when either the buffer contains the given number elements or the
     given amount of milliseconds has passed since last buffered event.
  
     * @param {number | DelayFunction} delay in milliseconds or as a function
     * @param {number} count  maximum buffer size
     */
    bufferWithTimeOrCount(delay?: number | DelayFunction, count?: number): EventStream<V[]>;
    changes(): EventStream<V>;
    /**
     Concatenates two streams/properties into one stream/property so that
     it will deliver events from this observable until it ends and then deliver
     events from `other`. This means too that events from `other`,
     occurring before the end of this observable will not be included in the result
     stream/property.
     */
    concat(other: Observable<V>, options?: EventStreamOptions): EventStream<V>;
    concat<V2>(other: Observable<V2>, options?: EventStreamOptions): EventStream<V | V2>;
    /** @hidden */
    transformChanges(desc: Desc, f: EventStreamDelay<V>): this;
    /**
     For each element in the source stream, spawn a new
     stream/property using the function `f`. Collect events from each of the spawned
     streams into the result stream/property. Note that instead of a function, you can provide a
     stream/property too. Also, the return value of function `f` can be either an
     `Observable` (stream/property) or a constant value.
  
     `stream.flatMap()` can be used conveniently with [`Bacon.once()`](../globals.html#once) and [`Bacon.never()`](../globals.html#never)
     for converting and filtering at the same time, including only some of the results.
  
     Example - converting strings to integers, skipping empty values:
  
     ```js
     stream.flatMap(function(text) {
      return (text != "") ? parseInt(text) : Bacon.never()
  })
     ```
     */
    flatMap<V2>(f: SpawnerOrObservable<V, V2>): EventStream<V2>;
    /**
     A [`flatMapWithConcurrencyLimit`](#flatmapwithconcurrencylimit) with limit of 1.
     */
    flatMapConcat<V2>(f: SpawnerOrObservable<V, V2>): EventStream<V2>;
    /**
     Like [`flatMap`](#flatmap), but is applied only on [`Error`](error.html) events. Returned values go into the
     value stream, unless an error event is returned. As an example, one type of error could result in a retry and another just
     passed through, which can be implemented using flatMapError.
     */
    flatMapError<V2>(f: Function1<any, Observable<V2> | EventOrValue<V2>>): EventStream<V | V2>;
    /**
     Like [`flatMap`](#observable-flatmap), but only spawns a new
     stream if the previously spawned stream has ended.
     */
    flatMapFirst<V2>(f: SpawnerOrObservable<V, V2>): EventStream<V2>;
    /**
     Like [`flatMap`](#flatmap), but instead of including events from
     all spawned streams, only includes them from the latest spawned stream.
     You can think this as switching from stream to stream.
     Note that instead of a function, you can provide a stream/property too.
     */
    flatMapLatest<V2>(f: SpawnerOrObservable<V, V2>): EventStream<V2>;
    /**
     A super method of *flatMap* family. It limits the number of open spawned streams and buffers incoming events.
     [`flatMapConcat`](#flatmapconcat) is `flatMapWithConcurrencyLimit(1)` (only one input active),
     and [`flatMap`](#flatmap) is `flatMapWithConcurrencyLimit ∞` (all inputs are piped to output).
     */
    flatMapWithConcurrencyLimit<V2>(limit: number, f: SpawnerOrObservable<V, V2>): EventStream<V2>;
    flatMapEvent<V2>(f: EventSpawner<V, V2>): EventStream<V2>;
    /**
     Scans stream with given seed value and accumulator function, resulting to a Property.
     Difference to [`scan`](#scan) is that the function `f` can return an [`EventStream`](eventstream.html) or a [`Property`](property.html) instead
     of a pure value, meaning that you can use [`flatScan`](#flatscan) for asynchronous updates of state. It serializes
     updates so that that the next update will be queued until the previous one has completed.
  
     * @param seed initial value to start with
     * @param f transition function from previous state and new value to next state
     * @typeparam V2 state and result type
     */
    flatScan<V2>(seed: V2, f: Function2<V2, V, Observable<V2>>): Property<V2>;
    /**
     Groups stream events to new streams by `keyF`. Optional `limitF` can be provided to limit grouped
     stream life. Stream transformed by `limitF` is passed on if provided. `limitF` gets grouped stream
     and the original event causing the stream to start as parameters.
  
     Calculator for grouped consecutive values until group is cancelled:
  
     ```
     var events = [
     {id: 1, type: "add", val: 3 },
     {id: 2, type: "add", val: -1 },
     {id: 1, type: "add", val: 2 },
     {id: 2, type: "cancel"},
     {id: 3, type: "add", val: 2 },
     {id: 3, type: "cancel"},
     {id: 1, type: "add", val: 1 },
     {id: 1, type: "add", val: 2 },
     {id: 1, type: "cancel"}
     ]
  
     function keyF(event) {
    return event.id
  }
  
     function limitF(groupedStream, groupStartingEvent) {
    var cancel = groupedStream.filter(function(x) { return x.type === "cancel"}).take(1)
    var adds = groupedStream.filter(function(x) { return x.type === "add" })
    return adds.takeUntil(cancel).map(".val")
  }
  
     Bacon.sequentially(2, events)
     .groupBy(keyF, limitF)
     .flatMap(function(groupedStream) {
      return groupedStream.fold(0, function(acc, x) { return acc + x })
    })
     .onValue(function(sum) {
      console.log(sum)
      // returns [-1, 2, 8] in an order
    })
     ```
  
     */
    groupBy<V2 = V>(keyF: Function1<V, string>, limitF?: GroupTransformer<V, V2>): EventStream<EventStream<V2>>;
    map<V2>(f: Function1<V, V2>): EventStream<V2>;
    map<V2>(f: Property<V2> | V2): EventStream<V2>;
    /**
     Merges two streams into one stream that delivers events from both
     */
    merge(other: EventStream<V>): EventStream<V>;
    merge<V2>(other: EventStream<V2>): EventStream<V | V2>;
    /**
     Returns a stream/property that inverts boolean values (using `!`)
     */
    not(): EventStream<boolean>;
    /**
     Adds a starting value to the stream/property, i.e. concats a
     single-element stream containing the single seed value  with this stream.
     */
    startWith(seed: V): EventStream<V>;
    /** @hidden */
    subscribeInternal(sink?: EventSink<V>): Unsub;
    /**
     * Returns this stream.
     */
    toEventStream(): this;
    /**
     Creates a Property based on the
     EventStream.
  
     Without arguments, you'll get a Property without an initial value.
     The Property will get its first actual value from the stream, and after that it'll
     always have a current value.
  
     You can also give an initial value that will be used as the current value until
     the first value comes from the stream.
     */
    toProperty(initValue?: V): Property<V>;
    transform<V2>(transformer: Transformer<V, V2>, desc?: Desc): EventStream<V2>;
    /**
     Creates an EventStream/Property by sampling a given `samplee`
     stream/property value at each event from the this stream/property.
  
     @param {Observable<V2>} samplee
     @param f function to select/calculate the result value based on the value in the source stream and the samplee
  
     @typeparam V2  type of values in the samplee
     @typeparam R   type of values in the result
     */
    withLatestFrom<V2, R>(samplee: Observable<V2>, f: Function2<V, V2, R>): EventStream<R>;
    /**
     Lets you run a state machine
     on an observable. Give it an initial state object and a state
     transformation function that processes each incoming event and
     returns an array containing the next state and an array of output
     events. Here's an example where we calculate the total sum of all
     numbers in the stream and output the value on stream end:
  
     ```js
     Bacon.fromArray([1,2,3])
     .withStateMachine(0, function(sum, event) {
      if (event.hasValue)
        return [sum + event.value, []]
      else if (event.isEnd)
        return [undefined, [new Bacon.Next(sum), event]]
      else
        return [sum, [event]]
    })
     ```
     @param initState  initial state for the state machine
     @param f          the function that defines the state machine
     @typeparam  State   type of machine state
     @typeparam  Out     type of values to be emitted
     */
    withStateMachine<State, Out>(initState: State, f: StateF<V, State, Out>): EventStream<Out>;
}
/** @hidden */
export declare function newEventStream<V>(description: Desc, subscribe: Subscribe<V>): EventStream<V>;
/** @hidden */
export declare function newEventStreamAllowSync<V>(description: Desc, subscribe: Subscribe<V>): EventStream<V>;
export default Observable;
