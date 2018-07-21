import Dispatcher from "./dispatcher";
import Observable from "./observable";
import { nop } from "./helpers";
import { none, Option, Some } from "./optional";
import UpdateBarrier from "./updatebarrier";
import { endEvent, Event, initialEvent, Value } from "./event";
import _ from "./_"
import { EventSink, Subscribe } from "./types"
import { more, noMore } from "./reply";

export default class PropertyDispatcher<V, O extends Observable<V>> extends Dispatcher<V, O> {
  current: Option<Value<V>> = none()
  currentValueRootId?: number
  propertyEnded: boolean = false

  constructor(property: O, subscribe: Subscribe<V>, handleEvent?: EventSink<V>) {
    super(property, subscribe, handleEvent);
    this.subscribe = _.bind(this.subscribe, this);
  }

  push(event: Event<V>) {
    //console.log("dispatch", event, "from",  this)
    if (event.isEnd) {
      this.propertyEnded = true;
    }
    if (event instanceof Value) {
      //console.log("setting current")
      this.current = new Some(event);
      this.currentValueRootId = UpdateBarrier.currentEventId();
    } else if (event.hasValue) {
      console.error("Unknown event, two Bacons loaded?", event.constructor)
    } 
    return super.push(event)
  }

  maybeSubSource(sink: EventSink<V>, reply: any) {
    if (reply === noMore) {
      return nop;
    } else if (this.propertyEnded) {
      sink(endEvent());
      return nop;
    } else {
      return super.subscribe(sink);
    }
  }

  subscribe(sink: EventSink<V>) {
    // init value is "bounced" here because the base Dispatcher class
    // won't add more than one subscription to the underlying observable.
    // without bouncing, the init value would be missing from all new subscribers
    // after the first one
    var reply = more;

    if (this.current.isDefined && (this.hasSubscribers() || this.propertyEnded)) {
      // should bounce init value
      var dispatchingId = UpdateBarrier.currentEventId();
      var valId = this.currentValueRootId;
      if (!this.propertyEnded && valId && dispatchingId && dispatchingId !== valId) {
        // when subscribing while already dispatching a value and this property hasn't been updated yet
        // we cannot bounce before this property is up to date.
        //console.log("bouncing with possibly stale value", event.value, "root at", valId, "vs", dispatchingId)
        UpdateBarrier.whenDoneWith(this.observable, () => {
          if (this.currentValueRootId === valId) {
            //console.log("bouncing", this.current.get().value)
            return sink(initialEvent(this.current.get().value));
          }
        });
        // the subscribing thing should be defered
        return this.maybeSubSource(sink, reply);
      } else {
        //console.log("bouncing immdiately", this.current.get().value)
        UpdateBarrier.inTransaction(undefined, this, () => {
          reply = sink(initialEvent(this.current.get().value));
          return reply;
        }, []);
        return this.maybeSubSource(sink, reply);
      }
    } else {
      //console.log("normal subscribe", this)
      return this.maybeSubSource(sink, reply);
    }
  }

  inspect() {
    return this.observable + " current= " + this.current
  }
};
