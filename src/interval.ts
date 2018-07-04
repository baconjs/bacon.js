import Bacon from "./core";
import fromPoll from "./frompoll";
import { nextEvent } from "./event";
import { withDesc, Desc } from "./describe";
import EventStream from "./eventstream";

export function interval<V>(delay, value: V): EventStream<V> {
  return withDesc(new Desc(Bacon, "interval", [delay, value]), fromPoll<V>(delay, function() {
    return nextEvent(value);
  }));
}

Bacon.interval = interval;
