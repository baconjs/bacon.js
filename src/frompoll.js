import fromBinder from "./frombinder";
import { Desc, withDesc } from "./describe";
import Bacon from "./core";
import Scheduler from "./scheduler";

export default function fromPoll(delay, poll) {
  var desc = new Desc(Bacon, "fromPoll", [delay, poll]);
  return withDesc(desc, fromBinder((function(handler) {
    var id = Scheduler.scheduler.setInterval(handler, delay);
    return function() { return Scheduler.scheduler.clearInterval(id); };
  }), poll));
}

Bacon.fromPoll = fromPoll;
