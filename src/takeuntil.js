import Property from "./property";
import Observable from "./observable";
import "./mapend";
import "./skiperrors";
import { endEvent, nextEvent } from "./event";
import { more } from "./reply";
import { withDesc, Desc } from "./describe";
import { groupSimultaneous_ } from "./groupsimultaneous";
import { allowSync } from "./eventstream";

Observable.prototype.takeUntil = function(stopper) {
  var endMarker = {};
  let withEndMarker = groupSimultaneous_([this.mapEnd(endMarker), stopper.skipErrors()], allowSync)
  if (this instanceof Property) withEndMarker = withEndMarker.toProperty()
  let impl = withEndMarker.withHandler(function(event) {
      if (!event.hasValue) {
        return this.push(event);
      } else {
        var [data, stopper] = event.value;
        if (stopper.length) {
//            console.log(_.toString(data), "stopped by", _.toString(stopper))
          return this.push(endEvent());
        } else {
          var reply = more;
          for (var i = 0, value; i < data.length; i++) {
            value = data[i];
            if (value === endMarker) {
              reply = this.push(endEvent());
            } else {
              reply = this.push(nextEvent(value));
            }
          }
          return reply;
        }
      }
    }
    )
  return withDesc(new Desc(this, "takeUntil", [stopper]), impl);
};
