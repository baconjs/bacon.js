import { withDesc, Desc } from "./describe";
import { noMore } from "./reply";
import { endEvent } from "./event";
import Observable from "./observable";

Observable.prototype.last = function () {
  var lastEvent;
  // It's important not to use fat arrow here!
  return withDesc(new Desc(this, "last", []), this.withHandler(function (event) {
    if (event.isEnd) {
      // Push last event or `undefined`
      if (lastEvent) {
        this.push(lastEvent);
      }
      this.push(endEvent());
      return noMore;
    } else {
      lastEvent = event;
    }
  }));
};
