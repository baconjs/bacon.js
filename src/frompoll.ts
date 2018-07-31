import fromBinder, { EventLike } from "./frombinder";
import { Desc } from "./describe";
import GlobalScheduler from "./scheduler";

export default function fromPoll<V>(delay: number, poll: () => EventLike<V>) {
  var desc = new Desc("Bacon", "fromPoll", [delay, poll]);
  return fromBinder((function (handler) {
    var id = GlobalScheduler.scheduler.setInterval(handler, delay);
    return function () {
      return GlobalScheduler.scheduler.clearInterval(id);
    };
  }), poll).withDesc(desc);
}
