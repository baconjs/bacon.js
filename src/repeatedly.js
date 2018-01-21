import { withDesc, Desc } from "./describe";
import fromPoll from "./frompoll";
import Bacon from "./core";

export default function repeatedly(delay, values) {
  var index = 0;
  return withDesc(new Desc(Bacon, "repeatedly", [delay, values]), fromPoll(delay, function() {
    return values[index++ % values.length];
  }));
}

Bacon.repeatedly = repeatedly;
