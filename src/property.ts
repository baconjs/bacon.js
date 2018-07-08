import Observable from "./observable";
import EventStream, { Options } from "./eventstream";
import { nop } from "./helpers";
import { assertFunction, assertNoArguments } from "./assert";
import { Event } from "./event";
import { Desc } from "./describe";
import { registerObs } from "./spy";
import { EventSink, Subscribe, Transformer, Unsub } from "./types"
import PropertyDispatcher from "./propertydispatcher"
import { filter } from "./filter"
import map from "./map"
import { default as withStateMachine, StateF } from "./withstatemachine";
import addPropertyInitValueToStream from "./addpropertyinitialvaluetostream";
import { Spawner } from "./flatmap_";
import flatMap from "./flatmap";
import flatMapFirst from "./flatmapfirst";
import takeUntil from "./takeuntil";
import flatMapWithConcurrencyLimit from "./flatmapwithconcurrencylimit";
import flatMapConcat from "./flatmapconcat";
import flatMapError from "./flatmaperror";
import { default as flatMapEvent, EventSpawner } from "./flatmapevent";
import flatMapLatest from "./flatmaplatest";
import { sampledByP, sampleP } from "./sample";
import fold from "./fold";
import { Accumulator } from "./scan";
import skip from "./skip";
import { startWithP } from "./startwith";

export default class Property<V> extends Observable<V> {
  dispatcher: PropertyDispatcher<V, Property<V>>
  constructor(desc: Desc, subscribe: Subscribe<V>, handler?: EventSink<V>) {
    super(desc)
    assertFunction(subscribe);
    this.dispatcher = new PropertyDispatcher(this, subscribe, handler);
    registerObs(this);
  }

  _isProperty = true

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
    return new Property<V2>(
      new Desc(this, "transform", [transformer]),
      sink =>
        this.subscribeInternal(e =>
          transformer(e, sink)
        )
    ).withDesc(desc);
  }

  withStateMachine<State,Out>(initState: State, f: StateF<V, State, Out>): Property<Out> {
    return <any>withStateMachine<V, State, Out>(initState, f, this)
  }

  filter(f: ((V) => boolean) | boolean | Property<boolean>): this {
    return <any>filter(f, this)
  }

  map<V2>(f: ((V) => V2) | Property<V2>): Property<V2> { return <any>map(f, this) }

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

  fold<V2>(seed: V2, f: Accumulator<V, V2>): Property<V2> {
    return fold(this, seed, f)
  }

  takeUntil(stopper: Observable<any>): Property<V> {
    return <any>takeUntil(this, stopper)
  }

  skip(count: number): Property<V> {
    return <any>skip(this, count)
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

  toEventStream(options?: Options): EventStream<V> {
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