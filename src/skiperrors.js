import { withDesc, Desc } from "./describe";
import { more } from "./reply";
import Observable from "./observable";

Observable.prototype.skipErrors = function() {
  return withDesc(new Desc(this, "skipErrors", []), this.withHandler(function(event) {
    if (event.isError) {
      return more;
    } else {
      return this.push(event);
    }
  }));
};
