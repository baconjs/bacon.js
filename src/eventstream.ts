import Observable from "./observable";
import { Desc } from "./describe";
import { nop } from "./helpers";
import { registerObs } from "./spy";
import Dispatcher from "./dispatcher";
import asyncWrapSubscribe from "./asyncwrapsubscribe"
import { EventSink, EventStreamDelay, Subscribe, Transformer, Unsub } from "./types"
import { filter } from "./filter"
import Property from "./property"
import { none, Option, toOption } from "./optional"
import streamSubscribeToPropertySubscribe from "./streamsubscribetopropertysubscribe"
import map from "./map"
import { default as withStateMachine, StateF } from "./withstatemachine";
import { concatE } from "./concat";
import { assertEventStream } from "./assert";
import { mergeAll } from "./merge";
import { Spawner } from "./flatmap_";
import flatMap from "./flatmap";
import flatMapFirst from "./flatmapfirst";
import takeUntil from "./takeuntil";
import flatMapWithConcurrencyLimit from "./flatmapwithconcurrencylimit";
import flatMapConcat from "./flatmapconcat";
import flatMapError from "./flatmaperror";
import { default as flatMapEvent, EventSpawner } from "./flatmapevent";
import flatMapLatest from "./flatmaplatest";
import { sampledByE } from "./sample";
import fold from "./fold";
import { Accumulator } from "./scan";
import skip from "./skip";
import { startWithE } from "./startwith";
import { combine } from "./combine";
import { not } from "./boolean";
import { bufferWithCount, bufferWithTime, bufferWithTimeOrCount } from "./buffer";

// allowSync option is used for overriding the "force async" behaviour or EventStreams.
// ideally, this should not exist, but right now the implementation of some operations
// relies on using internal EventStreams that have synchronous behavior. These are not exposed
// to the outside world, though.
export const allowSync = { forceAsync: false }
export interface Options { forceAsync: boolean }

export default class EventStream<V> extends Observable<V> {
  dispatcher: Dispatcher<V, EventStream<V>>
  _isEventStream: boolean = true
  constructor(desc: Desc, subscribe: Subscribe<V>, handler?: EventSink<V>, options?: Options) {
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
    return new EventStream<V2>(
      new Desc(this, "transform", [transformer]),
      sink =>
        this.subscribeInternal(e =>
          transformer(e, sink)
        ),
      undefined,
      allowSync
    ).withDesc(desc)
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
  filter(f: ((V) => boolean) | boolean | Property<boolean>): this {
    return <any>filter(f, this)
  }
  map<V2>(f: ((V) => V2) | Property<V2>): EventStream<V2> { return <any>map(f, this) }

  flatMap<V2>(f: Spawner<V, V2>): EventStream<V2> { return <any>flatMap(this, f) }
  flatMapConcat<V2>(f: Spawner<V, V2>): EventStream<V2> { return <any>flatMapConcat(this, f) }
  flatMapFirst<V2>(f: Spawner<V, V2>): EventStream<V2> { return <any>flatMapFirst(this, f) }
  flatMapLatest<V2>(f: Spawner<V, V2>): EventStream<V2> { return <any>flatMapLatest(this, f) }
  flatMapWithConcurrencyLimit<V2>(limit: number, f: Spawner<V, V2>): EventStream<V2> { return <any>flatMapWithConcurrencyLimit(this, limit, f) }
  flatMapError(f: (any) => Observable<V>): EventStream<V> {return <any>flatMapError(this, f)}
  flatMapEvent<V2>(f: EventSpawner<V, V2>): EventStream<V2> { return <any>flatMapEvent(this, f)}

  sampledBy<V2, R>(sampler: Observable<V2>, f: (V, V2) => R = (a, b) => a): Observable<R> {return sampledByE(this, sampler, f)}

  fold<V2>(seed: V2, f: Accumulator<V, V2>): Property<V2> {
    return fold(this, seed, f)
  }

  takeUntil(stopper: Observable<any>): EventStream<V> {
    return <any>takeUntil(this, stopper)
  }

  skip(count: number): EventStream<V> {
    return <any>skip(this, count)
  }

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
  concat(right: Observable<V>, options?: Options): EventStream<V> {
    return concatE(this, right, options)
  }

  merge(other: EventStream<V>): EventStream<V> {
    assertEventStream(other)
    return mergeAll<V>(this, other).withDesc(new Desc(this, "merge", [other]));
  }

  combine<V2, R>(right: Observable<V2>, f: (V, V2) => R): Property<R> {
    return combine(this, right, f)
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