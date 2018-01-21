import EventStream from "./eventstream";
import { assertArray } from "./helpers";
import { withDesc, Desc } from "./describe";
import never from "./never";
import { toEvent, endEvent } from "./event";
import { more, noMore } from "./reply";
import UpdateBarrier from "./updatebarrier";
import Bacon from "./core";

export default Bacon.fromArray = function(values) {
  assertArray(values);
  if (!values.length) {
    return withDesc(new Desc(Bacon, "fromArray", values), never());
  } else {
    var i = 0;
    var stream = new EventStream(new Desc(Bacon, "fromArray", [values]), function(sink) {
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
      };

      push();
      return function() {
        unsubd = true;
        return unsubd;
      };
    });
    return stream;
  }
};
