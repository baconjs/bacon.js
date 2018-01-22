import Bacon from "./core";
import fromPoll from "./frompoll";
import { nextEvent } from "./event";
import { withDesc, Desc } from "./describe";

export function interval(delay, value = {}) {
  return withDesc(new Desc(Bacon, "interval", [delay, value]), fromPoll(delay, function() {
    return nextEvent(value);
  }));
}

Bacon.interval = interval;
