import EventStream from "./eventstream";
import UpdateBarrier from "./updatebarrier";
import { Desc } from "./describe";
import { toEvent, endEvent } from "./event";
import Bacon from "./core";
import { nop } from "./helpers";

export default function once(value) {
  const s = new EventStream(new Desc(Bacon, "once", [value]), function(sink) {
    UpdateBarrier.soonButNotYet(s, function() {
      sink(toEvent(value));
      sink(endEvent());  
    })
    return nop
  });
  return s
}

Bacon.once = once;
