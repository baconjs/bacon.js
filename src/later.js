import { withDesc, Desc } from "./describe";
import { endEvent } from "./event";
import Bacon from "./core";
import fromBinder from "./frombinder";
import "./scheduler"
import Scheduler from "./scheduler";

export default function later(delay, value) {
  return withDesc(new Desc(Bacon, "later", [delay, value]), fromBinder(function(sink) {
    var sender = function() { return sink([value, endEvent()]); };
    var id = Scheduler.scheduler.setTimeout(sender, delay);
    return function() { return Scheduler.scheduler.clearTimeout(id); };
  }));
}

Bacon.later = later;
