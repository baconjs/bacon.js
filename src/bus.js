import _ from "./_";
import EventStream from "./eventstream";
import Bacon from "./core";
import { assertObservable, inherit, extend, cloneArray } from "./helpers";
import { nextEvent, endEvent, Error } from "./event";
import { Desc } from "./describe";

export default function Bus() {
  if (!(this instanceof Bus)) {
    return new Bus();
  }

  this.unsubAll = _.bind(this.unsubAll, this);
  this.subscribeAll = _.bind(this.subscribeAll, this);
  this.guardedSink = _.bind(this.guardedSink, this);

  this.sink = undefined;
  this.subscriptions = [];
  this.ended = false;
  EventStream.call(this, new Desc(Bacon, "Bus", []), this.subscribeAll);
}

inherit(Bus, EventStream);
extend(Bus.prototype, {
  unsubAll() {
    var iterable = this.subscriptions;
    for (var i = 0, sub; i < iterable.length; i++) {
      sub = iterable[i];
      if (typeof sub.unsub === "function") { sub.unsub(); }
    }
  },

  subscribeAll(newSink) {
    if (this.ended) {
      newSink(endEvent());
    } else {
      this.sink = newSink;
      var iterable = cloneArray(this.subscriptions);
      for (var i = 0, subscription; i < iterable.length; i++) {
        subscription = iterable[i];
        this.subscribeInput(subscription);
      }
    }
    return this.unsubAll;
  },

  guardedSink(input) {
    return (event) => {
      if (event.isEnd()) {
        this.unsubscribeInput(input);
        return Bacon.noMore;
      } else {
        return this.sink(event);
      }
    };
  },

  subscribeInput(subscription) {
    subscription.unsub = subscription.input.dispatcher.subscribe(this.guardedSink(subscription.input));
    return subscription.unsub;
  },

  unsubscribeInput(input) {
    var iterable = this.subscriptions;
    for (var i = 0, sub; i < iterable.length; i++) {
      sub = iterable[i];
      if (sub.input === input) {
        if (typeof sub.unsub === "function") { sub.unsub(); }
        this.subscriptions.splice(i, 1);
        return;
      }
    }
  },

  plug(input) {
    assertObservable(input);
    if (this.ended) { return; }
    var sub = { input: input };
    this.subscriptions.push(sub);
    if (typeof this.sink !== "undefined") { this.subscribeInput(sub); }
    return (() => this.unsubscribeInput(input));
  },

  end() {
    this.ended = true;
    this.unsubAll();
    if (typeof this.sink === "function") { return this.sink(endEvent()); }
  },

  push(value) {
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
            var value = this.pushQueue[i]
            this.sink(nextEvent(value))
            i++
          }
          this.pushQueue = null
        }
        this.pushing = false
      }
    }
  },

  error(error) {
    if (typeof this.sink === "function") { return this.sink(new Error(error)); }
  }
});

Bacon.Bus = Bus;
