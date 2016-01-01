import { withDesc, Desc } from "./describe";
import { more } from "./reply";
import Observable from "./observable";

Observable.prototype.skip = function(count) {
  return withDesc(new Desc(this, "skip", [count]), this.withHandler(function(event) {
    if (!event.hasValue()) {
      return this.push(event);
    } else if (count > 0) {
      count--;
      return more;
    } else {
      return this.push(event);
    }
  }));
};
