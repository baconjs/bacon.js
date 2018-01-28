import Observable from "./observable";
import Property from "./property";
import { Initial } from "./event";
import { toCombinator } from "./functionconstruction";
import { noMore, more } from "./reply";
import { nop } from "./helpers";
import { Desc } from "./describe";
import UpdateBarrier from "./updatebarrier";

export default function scan(seed, f) {
  var resultProperty;
  f = toCombinator(f);
  var acc = seed
  var initHandled = false;
  var subscribe = (sink) => {
    var initSent = false;
    var unsub = nop;
    var reply = more;
    var sendInit = function() {
      if (!initSent) {
        initSent = initHandled = true;
        reply = sink(new Initial(acc));
        if (reply === noMore) {
          unsub();
          unsub = nop;
        }
      }
    };
    unsub = this.dispatcher.subscribe(function(event) {
      if (event.hasValue) {
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
  return resultProperty = new Property(new Desc(this, "scan", [seed, f]), subscribe)
}

Observable.prototype.scan = scan;
