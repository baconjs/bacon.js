import Observable from "./observable";
import { Desc } from "./describe";
import { nop } from "./helpers";
import { registerObs } from "./spy";
import Dispatcher from "./dispatcher";
import asyncWrapSubscribe from "./asyncwrapsubscribe"
import { EventSink, Subscribe, Transformer, Unsub } from "./types"
import { takeE } from "./take"
import { filter } from "./filter"
import Property from "./property"
import { none, Option, toOption } from "./optional"
import streamSubscribeToPropertySubscribe from "./streamsubscribetopropertysubscribe"
import map from "./map"
import { default as withStateMachine, StateF } from "./withstatemachine";
import { default as skipDuplicates, Equals } from "./skipduplicates";

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
    return new EventStream(
      desc || new Desc(this, "transform", [transformer]), 
      sink => 
        this.subscribeInternal(e =>
            transformer(e, sink)
        ),
      undefined,
        allowSync
      )
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
  take(count: number): EventStream<V> {
    return takeE(count, this)
  }
  filter(f: ((V) => boolean) | boolean | Property<boolean>): EventStream<V> {
    return <any>filter(f, this)
  }
  map<V2>(f: ((V) => V2) | Property<V2>): EventStream<V2> {
    return <any>map(f, this)
  }
  skipDuplicates(isEqual?: Equals<V>): EventStream<V> {
    return <any>skipDuplicates(this, isEqual)
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
}
