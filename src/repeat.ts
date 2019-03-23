import fromBinder from "./frombinder";
import { more, noMore, Reply } from "./reply";
import { Event, endEvent } from "./event";
import { EventStream } from "./observable";
import { EventSink } from "./types";
import Observable from "./observable";
import { Desc } from "./describe";

/**
 Calls generator function which is expected to return an observable. The returned EventStream contains
 values and errors from the spawned observable. When the spawned observable ends, the generator is called
 again to spawn a new observable.

 This is repeated until the generator returns a falsy value
 (such as `undefined` or `false`).

 The generator function is called with one argument — iteration number starting from `0`.

 Here's an example:

```js
Bacon.repeat(function(i) {
if (i < 3) {
  return Bacon.once(i);
} else {
  return false;
}
}).log()
```

 The example will produce values 0, 1 and 2.

 @param {(number) => (Observable<V> | null)} generator
 @returns {EventStream<V>}
 @typeparam V Type of stream elements

 */
export default function repeat<V>(generator: (iteration: number) => (Observable<V> | undefined)): EventStream<V> {
  var index = 0;
  return fromBinder<V>(function(sink: EventSink<V>) {
    var flag = false;
    var reply = more;
    var unsub = function() {};
    function handleEvent(event: Event<V>): Reply {
      if (event.isEnd) {
        if (!flag) {
          flag = true;
        } else {
          subscribeNext();
        }
        return more
      } else {
        return reply = sink(event);
      }
    }
    function subscribeNext() {
      var next: Observable<V> | undefined;
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
      flag = true;
    }
    subscribeNext();
    return () => unsub();
  }).withDesc(new Desc("Bacon", "repeat", [generator]))
}
