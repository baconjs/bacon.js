import fromBinder from "./frombinder";
import { Desc, withDesc } from "./describe";
import Bacon from "./core";

export default function fromPoll(delay, poll) {
  var desc = new Desc(Bacon, "fromPoll", [delay, poll]);
  return withDesc(desc, fromBinder((function(handler) {
    var id = Bacon.scheduler.setInterval(handler, delay);
    return function() { return Bacon.scheduler.clearInterval(id); };
  }), poll));
}

Bacon.fromPoll = fromPoll;
