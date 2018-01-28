import { makeFunctionArgs } from "./functionconstruction";
import { withDesc, Desc } from "./describe";
import Observable from "./observable";

Observable.prototype.doError = function() {
  var f = makeFunctionArgs(arguments);
  return withDesc(new Desc(this, "doError", [f]), this.withHandler(function(event) {
    if (event.isError) { f(event.error); }
    return this.push(event);
  }));
};
