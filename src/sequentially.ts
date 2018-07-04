import fromPoll from "./frompoll";
import { Desc, withDesc } from "./describe";
import Bacon from "./core";
import { Event, endEvent, toEvent } from "./event";
import EventStream from "./eventstream";
import { EventLike } from "./frombinder";

export default function sequentially<V>(delay: number, values: (V | Event<V>)[]): EventStream<V> {
  var index = 0;
  return withDesc(new Desc(Bacon, "sequentially", [delay, values]), fromPoll<V>(delay, function(): EventLike<V> {
    var value = values[index++];
    if (index < values.length) {
      return value;
    } else if (index === values.length) {
      return [toEvent(value), endEvent()];
    } else {
      return endEvent();
    }
  }));
}

Bacon.sequentially = sequentially;
