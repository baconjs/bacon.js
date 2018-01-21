import { assertObservableIsProperty } from "./helpers";
import { withDesc, Desc } from "./describe";
import { convertArgsToFunction } from "./functionconstruction";
import { more } from "./reply";
import Observable from "./observable";

Observable.prototype.filter = function(f, ...args) {
  assertObservableIsProperty(f);
  return convertArgsToFunction(this, f, args, function(f) {
    return withDesc(new Desc(this, "filter", [f]), this.withHandler(function(event) {
      if (event.filter(f)) {
        return this.push(event);
      } else {
        return more;
      }
    }));
  });
};
