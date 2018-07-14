import UpdateBarrier from "./updatebarrier";
import { Desc, describe } from "./describe";
import { nop } from "./helpers";
import { EventSink, EventStreamDelay, Sink, Subscribe, Transformer, Unsub, VoidSink } from "./types"
import Property from "./property"
import { StateF } from "./withstatemachine";
import { default as skipDuplicates, Equals } from "./skipduplicates";
import { take } from "./take";
import log from "./log";
import doLogT from "./dolog";
import doErrorT from "./doerror";
import doActionT from "./doaction";
import doEndT from "./doend";
import { Accumulator, default as scan } from "./scan";
import EventStream from "./eventstream";
import mapEndT from "./mapend";
import mapErrorT from "./maperror";
import { Spawner } from "./flatmap_";
import skipErrors from "./skiperrors";
import last from "./last";
import { EventSpawner } from "./flatmapevent";
import endAsValue from "./endasvalue"
import endOnError from "./endonerror";
import awaiting from "./awaiting";

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

  abstract takeUntil(stopper: Observable<any>): Observable<V>

  first(): this {
    return <any>take(1, this, new Desc(this, "first"))
  }

  last(): this {
    return <any>last(this)
  }

  endAsValue(): Observable<{}> {
    return endAsValue(this)
  }

  abstract filter(f: ((V) => boolean) | boolean | Property<boolean>): this

  errors(): this {
    return this.filter(x => false).withDesc(new Desc(this, "errors"))
  }
  skipErrors(): this {
    return <any>skipErrors(this)
  }

  abstract map<V2>(f: ((V) => V2) | Property<V2>): Observable<V2>

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

  abstract skip(count: number): Observable<V>

  skipDuplicates(isEqual?: Equals<V>): this {
    return <any>skipDuplicates(this, isEqual)
  }

  scan<V2>(seed: V2, f: Accumulator<V, V2>): Property<V2> {
    return scan(this, seed, f)
  }

  abstract fold<V2>(seed: V2, f: Accumulator<V, V2>): Property<V2>

  abstract concat(right: Observable<V>): Observable<V>

  abstract startWith(seed: V): Observable<V>

  // TODO: now there are identical duplicate implementations in both subclasses, because implementing here
  // causes it to fail. Some circular-dep thingin going on with rollup.
  abstract combine<V2, R>(right: Observable<V2>, f: (V, V2) => R): Property<R>

  awaiting(other: Observable<any>): Property<boolean> {
    return awaiting(this, other)
  }

  abstract not(): Observable<boolean>

  abstract delayChanges(desc: Desc, f: EventStreamDelay<V>): this

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