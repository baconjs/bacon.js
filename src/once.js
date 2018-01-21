import EventStream from "./eventstream";
import { Desc } from "./describe";
import { toEvent, endEvent } from "./event";
import Bacon from "./core";
import { nop } from "./helpers";

export default function once(value) {
  return new EventStream(new Desc(Bacon, "once", [value]), function(sink) {
    sink(toEvent(value));
    sink(endEvent());
    return nop;
  });
}

Bacon.once = once;
