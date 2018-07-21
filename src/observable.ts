import UpdateBarrier from "./updatebarrier";
import { Desc, describe } from "./describe";
import { nop } from "./helpers";
import { EventSink, EventStreamDelay, Sink, Subscribe, Unsub, VoidSink } from "./types"
import { default as withStateMachine, StateF } from "./withstatemachine";
import { default as skipDuplicates, Equals } from "./skipduplicates";
import { take } from "./take";
import log from "./log";
import doLogT from "./dolog";
import doErrorT from "./doerror";
import doActionT from "./doaction";
import doEndT from "./doend";
import { Accumulator, default as scan } from "./scan";
import mapEndT from "./mapend";
import mapErrorT from "./maperror";
import { Spawner } from "./flatmap_";
import skipErrors from "./skiperrors";
import last from "./last";
import { default as flatMapEvent, EventSpawner } from "./flatmapevent";
import endAsValue from "./endasvalue"
import endOnError from "./endonerror";
import awaiting from "./awaiting";
import { combine } from "./combine";
import { assertEventStream, assertFunction, assertNoArguments } from "./assert";
import skip from "./skip";
import map from "./map";
import flatMapConcat from "./flatmapconcat";
import { sampledByE, sampledByP, sampleP } from "./sample";
import { filter } from "./filter";
import { and, not, or } from "./boolean";
import flatMapFirst from "./flatmapfirst";
import addPropertyInitValueToStream from "./addpropertyinitialvaluetostream";
import fold from "./fold";
import { startWithE, startWithP } from "./startwith";
import takeUntil from "./takeuntil";
import flatMap from "./flatmap";
import flatMapError from "./flatmaperror";
import { registerObs } from "./spy";
import flatMapLatest from "./flatmaplatest";
import PropertyDispatcher from "./propertydispatcher";
import flatMapWithConcurrencyLimit from "./flatmapwithconcurrencylimit";
import { Event } from "./event";
import Dispatcher from "./dispatcher";
import { concatE } from "./concat";
import { bufferWithCount, bufferWithTime, bufferWithTimeOrCount } from "./buffer";
import asyncWrapSubscribe from "./asyncwrapsubscribe";
import { none, Option, toOption } from "./optional";
import { mergeAll } from "./merge";
import streamSubscribeToPropertySubscribe from "./streamsubscribetopropertysubscribe";
import delay from "./delay";
import { debounce, debounceImmediate } from "./debounce";
import throttle from "./throttle";
import bufferingThrottle from "./bufferingthrottle";
import { Transformer, transformE, transformP } from "./transform";
import { takeWhile } from "./takewhile";
import skipUntil from "./skipuntil";

var idCounter = 0;

export default abstract class Observable<V> {
  desc: Desc
  id: number = ++idCounter
  initialDesc: Desc
  _name?: string
  _isObservable = true

  constructor(desc: Desc) {
    this.desc = desc
    this.initialDesc = desc
  }

  subscribe(sink: EventSink<V> = nop): Unsub {
    return UpdateBarrier.wrappedSubscribe(this, sink => this.subscribeInternal(sink), sink)
  }

  abstract subscribeInternal(sink: EventSink<V>): Unsub

  onValue(f: Sink<V> = nop) : Unsub {
    return this.subscribe(function(event) {
      if (event.hasValue) { return f(event.value) }
    });
  }

  forEach(f: Sink<V> = nop) : Unsub {
    // TODO: inefficient alias. Also, similar assign alias missing.
    return this.onValue(f)
  }

  onValues(f): Unsub {
    return this.onValue(function(args) { return f(...args) });
  }

  onError(f: Sink<any> = nop): Unsub {
    return this.subscribe(function(event) {
      if (event.isError) { return f(event.error) }
    })
  }

  onEnd(f: VoidSink = nop): Unsub {
    return this.subscribe(function(event) {
      if (event.isEnd) { return f(); }
    });
  }

  abstract toProperty(): Property<V>

  abstract toEventStream(): EventStream<V>

  abstract transform<V2>(transformer: Transformer<V, V2>, desc?: Desc): Observable<V2>

  abstract withStateMachine<State,Out>(initState: State, f: StateF<V, State, Out>): Observable<Out>

  take(count: number): this {
    return <any>take(count, this)
  }

  takeUntil(stopper: Observable<any>): this {
    return <any>takeUntil(this, stopper)
  }

  skipUntil(starter: Observable<any>): this {
    return <any>skipUntil(this, starter)
  }

  takeWhile<V>(f: ((V) => boolean) | Property<boolean>): this {
    return <any>takeWhile(this, f)
  }

  first(): this {
    return <any>take(1, this, new Desc(this, "first"))
  }

  last(): this {
    return <any>last(this)
  }

  endAsValue(): Observable<{}> {
    return endAsValue(this)
  }

  filter(f: ((V) => boolean) | boolean | Property<boolean>): this {
    return <any>filter(this, f)
  }

  errors(): this {
    return this.filter(x => false).withDesc(new Desc(this, "errors"))
  }

  skipErrors(): this {
    return <any>skipErrors(this)
  }

  abstract map<V2>(f: ((V) => V2) | Property<V2> | V2): Observable<V2>

  abstract flatMap<V2>(f: Spawner<V, V2>): Observable<V2>
  abstract flatMapConcat<V2>(f: Spawner<V, V2>): Observable<V2>
  abstract flatMapWithConcurrencyLimit<V2>(limit: number, f: Spawner<V, V2>): Observable<V2>
  abstract flatMapFirst<V2>(f: Spawner<V, V2>): Observable<V2>
  abstract flatMapLatest<V2>(f: Spawner<V, V2>): Observable<V2>
  abstract flatMapError(f: (any) => Observable<V>): Observable<V>
  abstract flatMapEvent<V2>(f: EventSpawner<V, V2>): Observable<V2>

  abstract sampledBy<V2, R>(sampler: Observable<V2>, f: (V, V2) => R): Observable<R>

  mapEnd(f: (() => V) | V): this {
    return <any>this.transform(mapEndT(f), new Desc(this, "mapEnd", [f]))
  }

  mapError(f: ((any) => V) | V): this {
    return <any>this.transform(mapErrorT(f), new Desc(this, "mapError", [f]))
  }

  endOnError(predicate: (any) => boolean = x => true): this {
    return <any>endOnError(this, predicate)
  }

  log(...args: any[]): this {
    log(args, this)
    return this
  }

  doLog(...args: any[]): this {
    return <any>this.transform(doLogT<V>(args), new Desc(this, "doLog", args))
  }

  doAction(f: (V) => any): this {
    return <any>this.transform(doActionT(f), new Desc(this, "doAction", [f]))
  }

  doEnd(f: Function): this {
    return <any>this.transform(doEndT(f), new Desc(this, "doEnd", [f]))
  }

  doError(f: Function): this {
    return <any>this.transform(doErrorT(f), new Desc(this, "doError", [f]))
  }

  skip(count: number): this {
    return <any>skip(this, count)
  }

  skipDuplicates(isEqual?: Equals<V>): this {
    return <any>skipDuplicates(this, isEqual)
  }

  scan<V2>(seed: V2, f: Accumulator<V, V2>): Property<V2> {
    return scan(this, seed, f)
  }

  fold<V2>(seed: V2, f: Accumulator<V, V2>): Property<V2> {
    return fold(this, seed, f)
  }

  abstract concat(right: Observable<V>): Observable<V>

  abstract startWith(seed: V): Observable<V>

  combine<V2, R>(right: Observable<V2>, f: (V, V2) => R): Property<R> {
    return combine(this, right, f)
  }

  awaiting(other: Observable<any>): Property<boolean> {
    return awaiting(this, other)
  }

  abstract not(): Observable<boolean>

  abstract delayChanges(desc: Desc, f: EventStreamDelay<V>): this

  delay(delayMs: number): this {
    return <any>delay(this, delayMs)
  }

  debounce(minimumInterval: number): this {
    return <any>debounce(this, minimumInterval)
  }

  debounceImmediate(minimumInterval: number): this {
    return <any>debounceImmediate(this, minimumInterval)
  }

  throttle(minimumInterval: number): this {
    return <any>throttle(this, minimumInterval)
  }

  bufferingThrottle(minimumInterval: number): this {
    return <any>bufferingThrottle(this, minimumInterval)
  }

  name(name: string) {
    this._name = name;
    return this;
  }

  withDescription(context, method, ...args) {
    this.desc = describe(context, method, ...args);
    return this;
  }

  toString(): string {
    if (this._name) {
      return this._name;
    } else {
      return this.desc.toString();
    }
  }

  inspect() { return this.toString() }

  deps(): any[] {
    return this.desc.deps()
  }

  internalDeps(): any[] {
    return this.initialDesc.deps();
  }

  withDesc(desc?: Desc): this {
    if (desc) this.desc = desc;
    return this;
  }
}

export interface ObservableConstructor {
  (description: Desc, subscribe: Subscribe<any>): Observable<any>
}

export class Property<V> extends Observable<V> {
  dispatcher: PropertyDispatcher<V, Property<V>>
  _isProperty = true

  constructor(desc: Desc, subscribe: Subscribe<V>, handler?: EventSink<V>) {
    super(desc)
    assertFunction(subscribe);
    this.dispatcher = new PropertyDispatcher(this, subscribe, handler);
    registerObs(this);
  }

  subscribeInternal(sink: EventSink<V> = nop): Unsub {
    return this.dispatcher.subscribe(sink)
  }

  changes(): EventStream<V> {
    return new EventStream(
      new Desc(this, "changes", []),
      (sink) => this.dispatcher.subscribe(function(event: Event<V>) {
        if (!event.isInitial) { return sink(event); }
      })
    )
  }

  transform<V2>(transformer: Transformer<V, V2>, desc? : Desc): Property<V2> {
    return transformP(this, transformer, desc)
  }

  withStateMachine<State,Out>(initState: State, f: StateF<V, State, Out>): Property<Out> {
    return <any>withStateMachine<V, State, Out>(initState, f, this)
  }

  map<V2>(f: ((V) => V2) | Property<V2>): Property<V2> { return <any>map<V, V2>(this, f) }

  flatMap<V2>(f: Spawner<V, V2>): Property<V2> { return <any>flatMap(this, f) }
  flatMapConcat<V2>(f: Spawner<V, V2>): Property<V2> { return <any>flatMapConcat(this, f) }
  flatMapFirst<V2>(f: Spawner<V, V2>): Property<V2> { return <any>flatMapFirst(this, f) }
  flatMapLatest<V2>(f: Spawner<V, V2>): Property<V2> { return <any>flatMapLatest(this, f) }
  flatMapWithConcurrencyLimit<V2>(limit: number, f: Spawner<V, V2>): Property<V2> { return <any>flatMapWithConcurrencyLimit(this, limit, f) }
  flatMapError(f: (any) => Observable<V>): EventStream<V> {return <any>flatMapError(this, f)}
  flatMapEvent<V2>(f: EventSpawner<V, V2>): EventStream<V2> { return <any>flatMapEvent(this, f)}

  sampledBy<V2, R>(sampler: Observable<V2>, f: (V, V2) => R = (a, b) => a): Observable<R> {return sampledByP(this, sampler, f)}

  sample(interval: number): EventStream<V> {
    return sampleP(this, interval)
  }

  startWith(seed: V): Property<V> {
    return startWithP(this, seed)
  }

  concat(right: Observable<V>): Property<V> {
    return addPropertyInitValueToStream<V>(this, this.changes().concat(right))
  }

  // deprecated : use transform() instead
  withHandler(handler: EventSink<V>) {
    return new Property(new Desc(this, "withHandler", [handler]), this.dispatcher.subscribe, handler);
  }

  toProperty(): Property<V> {
    assertNoArguments(arguments);
    return this;
  }

  or(other: Property<any>): Property<boolean> {return or(this, other)}
  and(other: Property<any>): Property<boolean> {return and(this, other)}
  not(): Property<boolean> {return <any>not(this) }


  delayChanges(desc: Desc, f: EventStreamDelay<V>): this {
    return <any>addPropertyInitValueToStream(this, f(this.changes())).withDesc(desc)
  }

  toEventStream(options?: EventStreamOptions): EventStream<V> {
    return new EventStream(
      new Desc(this, "toEventStream", []),
      (sink) => this.subscribeInternal(function(event) { return sink(event.toNext()); }),
      undefined,
      options
    );
  }
}

export function isProperty<V>(x): x is Property<V> {
  return !!x._isProperty
}

// allowSync option is used for overriding the "force async" behaviour or EventStreams.
// ideally, this should not exist, but right now the implementation of some operations
// relies on using internal EventStreams that have synchronous behavior. These are not exposed
// to the outside world, though.
export const allowSync = { forceAsync: false }
export interface EventStreamOptions { forceAsync: boolean }

export class EventStream<V> extends Observable<V> {
  dispatcher: Dispatcher<V, EventStream<V>>
  _isEventStream: boolean = true
  constructor(desc: Desc, subscribe: Subscribe<V>, handler?: EventSink<V>, options?: EventStreamOptions) {
    super(desc)
    if (options !== allowSync) {
      subscribe = asyncWrapSubscribe(this, subscribe)
    }
    this.dispatcher = new Dispatcher(this, subscribe, handler)
    registerObs(this)
  }

  subscribeInternal(sink: EventSink<V> = nop): Unsub {
    return this.dispatcher.subscribe(sink)
  }

  toEventStream() { return this }

  transform<V2>(transformer: Transformer<V, V2>, desc?: Desc): EventStream<V2> {
    return transformE(this, transformer, desc)
  }

  withStateMachine<State,Out>(initState: State, f: StateF<V, State, Out>): EventStream<Out> {
    return <any>withStateMachine<V, State, Out>(initState, f, this)
  }

  // deprecated : use transform() instead
  withHandler(handler: EventSink<V>) {
    return new EventStream(
      new Desc(this, "withHandler", [handler]),
      this.dispatcher.subscribe,
      handler,
      allowSync);
  }
  map<V2>(f: ((V) => V2) | Property<V2> | V2): EventStream<V2> { return <any>map(this, f) }

  flatMap<V2>(f: Spawner<V, V2>): EventStream<V2> { return <any>flatMap(this, f) }
  flatMapConcat<V2>(f: Spawner<V, V2>): EventStream<V2> { return <any>flatMapConcat(this, f) }
  flatMapFirst<V2>(f: Spawner<V, V2>): EventStream<V2> { return <any>flatMapFirst(this, f) }
  flatMapLatest<V2>(f: Spawner<V, V2>): EventStream<V2> { return <any>flatMapLatest(this, f) }
  flatMapWithConcurrencyLimit<V2>(limit: number, f: Spawner<V, V2>): EventStream<V2> { return <any>flatMapWithConcurrencyLimit(this, limit, f) }
  flatMapError(f: (any) => Observable<V>): EventStream<V> {return <any>flatMapError(this, f)}
  flatMapEvent<V2>(f: EventSpawner<V, V2>): EventStream<V2> { return <any>flatMapEvent(this, f)}

  sampledBy<V2, R>(sampler: Observable<V2>, f: (V, V2) => R = (a, b) => a): Observable<R> {return sampledByE(this, sampler, f)}

  startWith(seed: V): EventStream<V> {
    return startWithE(this,seed)
  }

  toProperty(...initValue_: (V | Option<V>)[]): Property<V> {
    let initValue: Option<V> = initValue_.length
      ? toOption<V>(initValue_[0])
      : none<V>()
    let disp = this.dispatcher
    let desc = new Desc(this, "toProperty", Array.prototype.slice.apply(arguments))
    let streamSubscribe = disp.subscribe
    return new Property(desc, streamSubscribeToPropertySubscribe(initValue, streamSubscribe))
  }
  concat(right: Observable<V>, options?: EventStreamOptions): EventStream<V> {
    return concatE(this, right, options)
  }

  merge(other: EventStream<V>): EventStream<V> {
    assertEventStream(other)
    return mergeAll<V>(this, other).withDesc(new Desc(this, "merge", [other]));
  }

  not(): EventStream<boolean> {return <any>not(this) }

  delayChanges(desc: Desc, f: EventStreamDelay<V>): this {
    return <any>f(this).withDesc(desc)
  }

  bufferWithTime(delay: number): EventStream<V> {
    return bufferWithTime(this, delay)
  }

  bufferWithCount(count: number): EventStream<V> {
    return bufferWithCount(this, count)
  }

  bufferWithTimeOrCount(delay?: number, count?: number): EventStream<V> {
    return bufferWithTimeOrCount(this, delay, count)
  }
}

export function newEventStream<V>(description: Desc, subscribe: Subscribe<V>) {
  return new EventStream(description, subscribe)
}