import { EventStream } from "./observable";
import UpdateBarrier from "./updatebarrier";
import { Desc } from "./describe";
import { endEvent, Event, toEvent } from "./event";
import { nop } from "./helpers";
import { EventSink } from "./types";

export default function once<V>(value: V | Event<V>): EventStream<V> {
  const s = new EventStream<V>(new Desc("Bacon", "once", [value]), function(sink: EventSink<V>) {
    UpdateBarrier.soonButNotYet(s, function() {
      sink(toEvent(value));
      sink(endEvent());  
    })
    return nop
  });
  return s
}