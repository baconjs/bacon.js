import { Desc } from "./describe";
import fromPoll from "./frompoll";
import Bacon from "./core";
import { EventStream } from "./observable";

export default function repeatedly<V>(delay: number, values: V[]): EventStream<V> {
  var index = 0;
  return fromPoll(delay, function () {
    return values[index++ % values.length];
  }).withDesc(new Desc(Bacon, "repeatedly", [delay, values]));
}

Bacon.repeatedly = repeatedly;
