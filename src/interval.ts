import Bacon from "./core";
import fromPoll from "./frompoll";
import { nextEvent } from "./event";
import { Desc } from "./describe";
import EventStream from "./eventstream";

export function interval<V>(delay, value: V): EventStream<V> {
  return fromPoll<V>(delay, function () {
    return nextEvent(value);
  }).withDesc(new Desc(Bacon, "interval", [delay, value]));
}

Bacon.interval = interval;
