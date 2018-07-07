import Observable from "./observable";
import Property from "./property";
import { Event, hasValue, Initial } from "./event";
import { more, noMore } from "./reply";
import { nop } from "./helpers";
import { Desc } from "./describe";
import UpdateBarrier from "./updatebarrier";
import { EventSink, Subscribe } from "./types";

export interface Accumulator<In, Out> {
  (acc: Out, next: In): Out
}

export default function scan<In, Out>(src: Observable<In>, seed: Out, f: Accumulator<In, Out>): Property<Out> {
  let resultProperty;
  let acc = seed
  let initHandled = false;
  const subscribe: Subscribe<Out> = (sink: EventSink<Out>) => {
    var initSent = false;
    var unsub = nop;
    var reply = more;
    const sendInit = function() {
      if (!initSent) {
        initSent = initHandled = true;
        reply = sink(new Initial(acc));
        if (reply === noMore) {
          unsub();
          unsub = nop;
        }
      }
      return reply
    };
    unsub = src.subscribeInternal(function(event: Event<In>) {
      if (hasValue(event)) {
        if (initHandled && event.isInitial) {
          //console.log "skip INITIAL"
          return more; // init already sent, skip this one
        } else {
          if (!event.isInitial) { sendInit(); }
          initSent = initHandled = true;
          var prev = acc
          var next = f(prev, event.value);
          //console.log prev , ",", event.value, "->", next
          acc = next
          return sink(event.apply(next));
        }
      } else {
        if (event.isEnd) {
          reply = sendInit();
        }
        if (reply !== noMore) {
          return sink(event);
        }
      }
    });
    UpdateBarrier.whenDoneWith(resultProperty, sendInit);
    return unsub;
  }
  return resultProperty = new Property(new Desc(src, "scan", [seed, f]), subscribe)
}