import UpdateBarrier from "./updatebarrier";
import { Desc, describe, withDesc } from "./describe";
import { nop } from "./helpers";
import { EventSink, Sink, Subscribe, Transformer, Unsub, VoidSink } from "./types"
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

  first(): this {
    return <any>take(1, this, new Desc(this, "first"))
  }

  abstract filter(f: ((V) => boolean) | boolean | Property<boolean>): this

  errors(): this {
    return withDesc(new Desc(this, "errors"), this.filter(x => false))
  }

  abstract map<V2>(f: ((V) => V2) | Property<V2>): Observable<V2>

  mapEnd(f: (End) => V): this {
    return <any>this.transform(mapEndT(f), new Desc(this, "mapEnd", [f]))
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

  skipDuplicates(isEqual?: Equals<V>): this {
    return <any>skipDuplicates(this, isEqual)
  }

  scan<V2>(seed: V2, f: Accumulator<V, V2>): Property<V2> {
    return scan(this, seed, f)
  }

  abstract concat(right: Observable<V>): Observable<V>

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
}

export interface ObservableConstructor {
  (description: Desc, subscribe: Subscribe<any>): Observable<any>
}