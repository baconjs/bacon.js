import { EventStream } from "./observable";
import { assertArray } from "./internal/assert";
import { Desc } from "./describe";
import never from "./never";
import { Event, endEvent, toEvent } from "./event";
import { more, noMore } from "./reply";
import UpdateBarrier from "./internal/updatebarrier";
import { EventSink } from "./types";

/**
 Creates an EventStream that delivers the given
 series of values (given as array) to the first subscriber. The stream ends after these
 values have been delivered. You can also send [`Bacon.Error`](classes/error.html) events, or
 any combination of pure values and error events like this:
 `Bacon.fromArray([1, new Bacon.Error()])

 @param   values    Array of values or events to repeat
 @typeparam V Type of stream elements
 */
export default function fromArray<T>(values: (T | Event<T>)[]) {
  assertArray(values);
  if (!values.length) {
    return never().withDesc(new Desc("Bacon", "fromArray", values));
  } else {
    var i = 0;
    var stream = new EventStream(new Desc("Bacon", "fromArray", [values]), function(sink: EventSink<T>) {
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
}