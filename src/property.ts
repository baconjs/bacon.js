import Observable from "./observable";
import EventStream from "./eventstream";
import { nop } from "./helpers";
import { assertFunction, assertNoArguments } from "./assert";
import { Event } from "./event";
import { Desc } from "./describe";
import { registerObs } from "./spy";
import { EventSink, Subscribe, Transformer, Unsub } from "./types"
import PropertyDispatcher from "./propertydispatcher"
import { takeP } from "./take"
import { filter } from "./filter"
import map from "./map"
import { default as withStateMachine, StateF } from "./withstatemachine";

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

  changes() {
    return new EventStream(
      new Desc(this, "changes", []), 
      (sink) => this.dispatcher.subscribe(function(event: Event<V>) {
          if (!event.isInitial) { return sink(event); }
      })
    )
  }
  
  transform<V2>(transformer: Transformer<V, V2>, desc? : Desc): Property<V2> {
    return new Property(
      new Desc(this, "transform", [transformer]), 
      sink => 
        this.subscribeInternal(e =>
            transformer(e, sink)
        )
      );
  }

  withStateMachine<State,Out>(initState: State, f: StateF<V, State, Out>): Property<Out> {
    return <any>withStateMachine<V, State, Out>(initState, f, this)
  }

  take(count: number): Property<V> {
    return takeP(count, this)
  }

  filter(f: ((V) => boolean) | boolean | Property<boolean>): Property<V> {
    return <any>filter(f, this)
  }

  map<V2>(f: ((V) => V2) | Property<V2>): Property<V2> {
    return <any>map(f, this)
  }

  withHandler(handler: EventSink<V>) {
    return new Property(new Desc(this, "withHandler", [handler]), this.dispatcher.subscribe, handler);
  }

  toProperty(): Property<V> {
    assertNoArguments(arguments);
    return this;
  }
}
