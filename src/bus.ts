import _ from "./_";
import { EventStream } from "./observable";
import Observable from "./observable"
import { Event, endEvent, Error, nextEvent } from "./event";
import { Desc } from "./describe";
import { EventSink, Unsub } from "./types"
import { assertObservable } from "./internal/assert";
import { Reply, noMore, more } from "./reply";

interface Subscription<V> {
  input: Observable<V>
  unsub: Unsub | undefined
}

/**
 An [`EventStream`](eventstream.html) that allows you to [`push`](#push) values into the stream.

 It also allows plugging other streams into the Bus, as inputs. The Bus practically
 merges all plugged-in streams and the values pushed using the [`push`](#push)
 method.
 */
export default class Bus<V> extends EventStream<V> {
  /** @hidden */
  sink?: EventSink<V>;
  /** @hidden */
  pushing: boolean = false
  /** @hidden */
  pushQueue? : V[] = undefined
  /** @hidden */
  ended: boolean = false
  /** @hidden */
  subscriptions: Subscription<V>[] = []

  constructor() {
    super(new Desc("Bacon", "Bus", []), (sink: EventSink<V>) => this.subscribeAll(sink))
    this.unsubAll = _.bind(this.unsubAll, this);
    this.subscribeAll = _.bind(this.subscribeAll, this);
    this.guardedSink = _.bind(this.guardedSink, this);
    this.subscriptions = [] // new array for each Bus instance
    this.ended = false;
  }

  /**
   Plugs the given stream as an input to the Bus. All events from
   the given stream will be delivered to the subscribers of the Bus.
   Returns a function that can be used to unplug the same stream.

   The plug method practically allows you to merge in other streams after
   the creation of the Bus.

   * @returns a function that can be called to "unplug" the source from Bus.
   */
  plug<V2 extends V>(input: Observable<V2>) {
    assertObservable(input);
    if (this.ended) { return; }
    var sub = { input: input as any as Observable<V>, unsub: undefined };
    this.subscriptions.push(sub);
    if (typeof this.sink !== "undefined") { this.subscribeInput(sub); }
    return (() => this.unsubscribeInput(input));
  }

  /**
   Ends the stream. Sends an [End](end.html) event to all subscribers.
   After this call, there'll be no more events to the subscribers.
   Also, the [`push`](#push), [`error`](#error) and [`plug`](#plug) methods have no effect.
   */
  end(): Reply {
    this.ended = true;
    this.unsubAll();
    if (typeof this.sink === "function") { return this.sink(endEvent()); }
  }

  /**
   * Pushes a new value to the stream.
   */
  push(value: V): Reply {
    if (!this.ended && typeof this.sink === "function") {
      var rootPush = !this.pushing
      if (!rootPush) {
        //console.log("recursive push")
        if (!this.pushQueue) this.pushQueue = []
        this.pushQueue.push(value)
        //console.log('queued', value)
        return
      }
      this.pushing = true
      try {
        return this.sink(nextEvent(value));
      } finally {
        if (rootPush && this.pushQueue) {
          //console.log("start processing queue", this.pushQueue.length)
          var i = 0
          while (i < this.pushQueue.length) {
            //console.log("in loop", i, this.pushQueue[i])
            var v = this.pushQueue[i]
            this.sink(nextEvent(v))
            i++
          }
          this.pushQueue = undefined
        }
        this.pushing = false
      }
    }
  }

  /**
   * Pushes an error to this stream.
   */
  error(error: any): Reply {
    if (typeof this.sink === "function") { return this.sink(new Error(error)); }
  }

  /** @hidden */
  unsubAll() {
    var iterable = this.subscriptions;
    for (var i = 0, sub; i < iterable.length; i++) {
      sub = iterable[i];
      if (typeof sub.unsub === "function") { sub.unsub(); }
    }
  }

  /** @hidden */
  subscribeAll(newSink: EventSink<V>) {
    if (this.ended) {
      newSink(endEvent());
    } else {
      this.sink = newSink;
      var iterable = this.subscriptions.slice();
      for (var i = 0, subscription; i < iterable.length; i++) {
        subscription = iterable[i];
        this.subscribeInput(subscription);
      }
    }
    return this.unsubAll;
  }

  /** @hidden */
  guardedSink(input: Observable<V>): EventSink<V> {
    return (event: Event<V>) => {
      if (event.isEnd) {
        this.unsubscribeInput(input);
        return noMore;
      } else if (this.sink) {
        return this.sink(event);
      } else {
        return more;
      }
    };
  }

  /** @hidden */
  subscribeInput(subscription: Subscription<V>) {
    subscription.unsub = subscription.input.subscribeInternal(this.guardedSink(subscription.input));
    return subscription.unsub;
  }

  /** @hidden */
  unsubscribeInput(input: Observable<any>) {
    var iterable = this.subscriptions;
    for (var i = 0, sub; i < iterable.length; i++) {
      sub = iterable[i];
      if (sub.input === input) {
        if (typeof sub.unsub === "function") { 
          sub.unsub(); 
        }
        this.subscriptions.splice(i, 1);
        return;
      }
    }
  }
}
