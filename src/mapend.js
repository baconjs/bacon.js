import { withDesc, Desc } from "./describe";
import { makeFunctionArgs } from "./functionconstruction";
import Observable from "./observable";
import { nextEvent, endEvent } from "./event";
import { noMore } from "./reply";

Observable.prototype.mapEnd = function() {
  var f = makeFunctionArgs(arguments);
  return withDesc(new Desc(this, "mapEnd", [f]), this.withHandler(function(event) {
    if (event.isEnd()) {
      this.push(nextEvent(f(event)));
      this.push(endEvent());
      return noMore;
    } else {
      return this.push(event);
    }
  }));
};
