import EventStream from "./eventstream";
import Property from "./property";
import addPropertyInitValueToStream from "./addpropertyinitialvaluetostream";
import "./mapend";
import "./skiperrors";
import { endEvent, nextEvent } from "./event";
import { more } from "./reply";
import { withDesc, Desc } from "./describe";
import groupSimultaneous from "./groupsimultaneous";

EventStream.prototype.takeUntil = function(stopper) {
  var endMarker = {};
  return withDesc(new Desc(this, "takeUntil", [stopper]), groupSimultaneous(this.mapEnd(endMarker), stopper.skipErrors())
    .withHandler(function(event) {
      if (!event.hasValue()) {
        return this.push(event);
      } else {
        var [data, stopper] = event.value();
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
    ));
};

Property.prototype.takeUntil = function(stopper) {
  var changes = this.changes().takeUntil(stopper);
  return withDesc(new Desc(this, "takeUntil", [stopper]), addPropertyInitValueToStream(this, changes));
};
