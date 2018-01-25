import fromBinder from "./frombinder";
import { more, noMore } from "./reply";
import { endEvent } from "./event";
import Bacon from "./core";

export default function repeat(generator) {
  var index = 0;
  return fromBinder(function(sink) {
    var flag = false;
    var reply = more;
    var unsub = function() {};
    function handleEvent(event) {
      if (event.isEnd()) {
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
      var next;
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
  });
}

Bacon.repeat = repeat;
