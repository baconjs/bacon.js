import { withDesc, Desc } from "./describe";
import fromPoll from "./frompoll";
import Bacon from "./core";
import EventStream from "./eventstream";

export default function repeatedly<V>(delay: number, values: V[]): EventStream<V> {
  var index = 0;
  return withDesc(new Desc(Bacon, "repeatedly", [delay, values]), fromPoll(delay, function() {
    return values[index++ % values.length];
  }));
}

Bacon.repeatedly = repeatedly;
