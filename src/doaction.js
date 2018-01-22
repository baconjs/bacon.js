import { makeFunctionArgs } from "./functionconstruction";
import { withDesc, Desc } from "./describe";
import Observable from "./observable";

Observable.prototype.doAction = function() {
  var f = makeFunctionArgs(arguments);
  return withDesc(new Desc(this, "doAction", [f]), this.withHandler(function(event) {
    if (event.hasValue()) { f(event.value); }
    return this.push(event);
  }));
};
