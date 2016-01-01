import { withDesc, Desc } from "./describe";
import { makeFunctionArgs } from "./functionconstruction";
import Observable from "./observable";
import { nextEvent } from "./event";

Observable.prototype.mapError = function() {
  const f = makeFunctionArgs(arguments);
  return withDesc(new Desc(this, "mapError", [f]), this.withHandler(function(event) {
    if (event.isError()) {
      return this.push(nextEvent(f(event.error)));
    } else {
      return this.push(event);
    }
  }));
};
