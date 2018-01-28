import Observable from "./observable";
import never from "./never";
import { noMore } from "./reply";
import { withDesc, Desc } from "./describe";
import { endEvent } from "./event";

Observable.prototype.take = function(count) {
  if (count <= 0) { return never(); }
  return withDesc(new Desc(this, "take", [count]), this.withHandler(function(event) {
    if (!event.hasValue) {
      return this.push(event);
    } else {
      count--;
      if (count > 0) {
        return this.push(event);
      } else {
        if (count === 0) { this.push(event); }
        this.push(endEvent());
        return noMore;
      }
    }
  }));
};
