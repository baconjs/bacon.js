import { nop } from "../helpers";
import { Reply, more, noMore } from "../reply";
import { Option, Some } from "../optional";
import { Event, Initial, Value } from "../event";
import { Sink, Subscribe, Unsub } from "../types"

/** @hidden */
export default function streamSubscribeToPropertySubscribe<V>(initValue: Option<V>, streamSubscribe: Subscribe<V>) {
  //assertFunction(streamSubscribe)
  return function(sink: Sink<V>) {
    var initSent = false;
    var subbed = false;
    var unsub: Unsub = nop;
    var reply: any = more;
    var sendInit = function() {
      if (!initSent) {
        return initValue.forEach(function(value) {
          initSent = true;
          reply = sink(new Initial(value));
          if (reply === noMore) {
            unsub();
            unsub = nop;
            return nop;
          }
        });
      }
    };

    unsub = streamSubscribe(function(event: Event<V>): Reply {
      if (event instanceof Value) {
        if (event.isInitial && !subbed) {
          initValue = new Some(event.value);
          return more;
        } else {
          if (!event.isInitial) { sendInit(); }
          initSent = true;
          initValue = new Some(event.value);
          return sink(event);
        }
      } else {
        if (event.isEnd) {
          reply = sendInit();
        }
        if (reply !== noMore) {
          return sink(event);
        }
        return reply
      }
    });
    subbed = true;
    sendInit();
    return unsub;
  }
}


