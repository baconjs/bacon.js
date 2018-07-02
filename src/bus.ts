import _ from "./_";
import EventStream from "./eventstream";
import Observable from "./observable"
import Bacon from "./core";
import { nextEvent, endEvent, Error } from "./event";
import { Desc } from "./describe";
import { EventSink } from "./types"
import { assertObservable } from "./assert";

interface Subscription<V> {
  input: Observable<V>
}

export default class Bus<V> extends EventStream<V> {
  sink?: EventSink<V>;
  pushing: boolean = false
  pushQueue? : V[] = undefined
  ended: boolean = false
  subscriptions: Subscription<V>[] = []

  constructor() {
    super(new Desc(Bacon, "Bus", []), (sink: EventSink<V>) => this.subscribeAll(sink))
    this.unsubAll = _.bind(this.unsubAll, this);
    this.subscribeAll = _.bind(this.subscribeAll, this);
    this.guardedSink = _.bind(this.guardedSink, this);
    this.subscriptions = [] // new array for each Bus instance
    this.ended = false;
    EventStream.call(this, new Desc(Bacon, "Bus", []), this.subscribeAll);
  }

  unsubAll() {
    var iterable = this.subscriptions;
    for (var i = 0, sub; i < iterable.length; i++) {
      sub = iterable[i];
      if (typeof sub.unsub === "function") { sub.unsub(); }
    }
  }

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

  guardedSink(input: Observable<V>) {
    return (event) => {
      if (event.isEnd) {
        this.unsubscribeInput(input);
        return Bacon.noMore;
      } else if (this.sink) {
        return this.sink(event);
      }
    };
  }

  subscribeInput(subscription) {
    subscription.unsub = subscription.input.dispatcher.subscribe(this.guardedSink(subscription.input));
    return subscription.unsub;
  }

  unsubscribeInput(input: Observable<V>) {
    var iterable = this.subscriptions;
    for (var i = 0, sub; i < iterable.length; i++) {
      sub = iterable[i];
      if (sub.input === input) {
        if (typeof sub.unsub === "function") { sub.unsub(); }
        this.subscriptions.splice(i, 1);
        return;
      }
    }
  }

  plug(input: Observable<V>) {
    assertObservable(input);
    if (this.ended) { return; }
    var sub = { input: input };
    this.subscriptions.push(sub);
    if (typeof this.sink !== "undefined") { this.subscribeInput(sub); }
    return (() => this.unsubscribeInput(input));
  }

  end() {
    this.ended = true;
    this.unsubAll();
    if (typeof this.sink === "function") { return this.sink(endEvent()); }
  }

  push(value: V) {
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

  error(error: any) {
    if (typeof this.sink === "function") { return this.sink(new Error(error)); }
  }
}
Bacon.Bus = Bus;
