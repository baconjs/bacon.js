import fromBinder from "./frombinder";
import { more, noMore } from "./reply";
import { Event, endEvent } from "./event";
import { EventStream } from "./observable";
import { EventSink } from "./types";
import Observable from "./observable";
import { Desc } from "./describe";

export default function repeat<V>(generator: (number) => (Observable<V> | null)): EventStream<V> {
  var index = 0;
  return fromBinder<V>(function(sink: EventSink<V>) {
    var flag = false;
    var reply = more;
    var unsub = function() {};
    function handleEvent(event: Event<V>) {
      if (event.isEnd) {
        if (!flag) {
          return flag = true;
        } else {
          return subscribeNext();
        }
      } else {
        return reply = sink(event);
      }
    }
    function subscribeNext() {
      var next: Observable<V> | null;
      flag = true;
      while (flag && reply !== noMore) {
        next = generator(index++);
        flag = false;
        if (next) {
          unsub = next.subscribeInternal(handleEvent);
        } else {
          sink(endEvent());
        }
      }
      return flag = true;
    }
    subscribeNext();
    return () => unsub();
  }).withDesc(new Desc("Bacon", "repeat", [generator]))
}