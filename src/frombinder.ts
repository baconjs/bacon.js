import _ from './_';
import { Event, isEvent, toEvent } from './event';
import { isArray } from './helpers';
import Bacon from './core';
import { Desc } from "./describe";
import EventStream from "./eventstream";
import { EventSink, Sink, Unsub } from "./types";

export type FlexibleSink<V> = Sink<EventLike<V>>

export type EventLike<V> = V | Event<V> | Event<V>[]

export interface Binder<V> {
  (sink: FlexibleSink<V>): Unsub
}

export interface EventTransformer<V> {
  (...args: any[]): EventLike<V>
}

export default function fromBinder<V>(binder: Binder<V>, eventTransformer: EventTransformer<V> = _.id): EventStream<V> {
  var desc = new Desc(Bacon, "fromBinder", [binder, eventTransformer]);
  return new EventStream(desc, function(sink: EventSink<V>) {
    var unbound = false;
    var shouldUnbind = false;
    var unbind = function() {
      if (!unbound) {
        if ((typeof unbinder !== "undefined" && unbinder !== null)) {
          unbinder();
          return unbound = true;
        } else {
          return shouldUnbind = true;
        }
      }
    };
    var unbinder = binder(function(...args) {
      var value_: EventLike<V> = eventTransformer(...args);
      let valueArray: (V | Event<V>)[] = isArray(value_) && isEvent(_.last(value_))
        ? <any>value_
        : <any>[value_]
      var reply = Bacon.more;
      for (var i = 0; i < valueArray.length; i++) {
        let event = toEvent(valueArray[i])
        reply = sink(event)
        if (reply === Bacon.noMore || event.isEnd) {
          // defer if binder calls handler in sync before returning unbinder
          unbind()
          return reply
        }
      }
      return reply
    })
    if (shouldUnbind) {
      unbind()
    }
    return unbind;
  })
}

Bacon.fromBinder = fromBinder;