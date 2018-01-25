import Observable from "./observable";
import { withDesc, Desc } from "./describe";
import { endEvent } from "./event";
import { convertArgsToFunction } from "./functionconstruction";

Observable.prototype.endOnError = function(f, ...args) {
  if (!(typeof f !== "undefined" && f !== null)) { f = true; }
  return convertArgsToFunction(this, f, args, function(f) {
    return withDesc(new Desc(this, "endOnError", []), this.withHandler(function(event) {
      if (event.isError() && f(event.error)) {
        this.push(event);
        return this.push(endEvent());
      } else {
        return this.push(event);
      }
    }));
  });
};
