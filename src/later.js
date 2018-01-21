import { withDesc, Desc } from "./describe";
import { endEvent } from "./event";
import Bacon from "./core";
import fromBinder from "./frombinder";
import "./scheduler"

export default function later(delay, value) {
  return withDesc(new Desc(Bacon, "later", [delay, value]), fromBinder(function(sink) {
    var sender = function() { return sink([value, endEvent()]); };
    var id = Bacon.scheduler.setTimeout(sender, delay);
    return function() { return Bacon.scheduler.clearTimeout(id); };
  }));
}

Bacon.later = later;
