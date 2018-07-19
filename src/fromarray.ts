import { EventStream } from "./observable";
import { assertArray } from "./assert";
import { Desc } from "./describe";
import never from "./never";
import { endEvent, toEvent } from "./event";
import { more, noMore } from "./reply";
import UpdateBarrier from "./updatebarrier";
import Bacon from "./core";
import { EventSink } from "./types";

export default function fromArray<T>(values: T[]) {
  assertArray(values);
  if (!values.length) {
    return never().withDesc(new Desc(Bacon, "fromArray", values));
  } else {
    var i = 0;
    var stream = new EventStream(new Desc(Bacon, "fromArray", [values]), function(sink: EventSink<T>) {
      var unsubd = false;
      var reply = more;
      var pushing = false;
      var pushNeeded = false;
      function push() {
        pushNeeded = true;
        if (pushing) {
          return;
        }
        pushing = true;
        while (pushNeeded) {
          pushNeeded = false;
          if ((reply !== noMore) && !unsubd) {
            var value = values[i++];
            reply = sink(toEvent(value));
            if (reply !== noMore) {
              if (i === values.length) {
                sink(endEvent());
              } else {
                UpdateBarrier.afterTransaction(stream, push);
              }
            }
          }
        }
        pushing = false;
        return pushing;
      }

      UpdateBarrier.soonButNotYet(stream, push)

      return function() {
        unsubd = true;
        return unsubd;
      };
    });
    return stream;
  }
};

Bacon.fromArray = fromArray