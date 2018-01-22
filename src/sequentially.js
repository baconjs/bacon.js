import fromPoll from "./frompoll";
import { Desc, withDesc } from "./describe";
import Bacon from "./core";
import { endEvent } from "./event";

export default function sequentially(delay, values) {
  var index = 0;
  return withDesc(new Desc(Bacon, "sequentially", [delay, values]), fromPoll(delay, function() {
    var value = values[index++];
    if (index < values.length) {
      return value;
    } else if (index === values.length) {
      return [value, endEvent()];
    } else {
      return endEvent();
    }
  }));
}

Bacon.sequentially = sequentially;
