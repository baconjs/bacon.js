import Observable from "./observable";
import { Desc } from "./describe";
import { endEvent } from "./event";
import { convertArgsToFunction } from "./functionconstruction";

Observable.prototype.endOnError = function(f, ...args) {
  if (!(typeof f !== "undefined" && f !== null)) { f = true; }
  return convertArgsToFunction(this, f, args, function(f) {
    return this.withHandler(function (event) {
      if (event.isError && f(event.error)) {
        this.push(event);
        return this.push(endEvent());
      } else {
        return this.push(event);
      }
    }).withDesc(new Desc(this, "endOnError", []));
  });
};
