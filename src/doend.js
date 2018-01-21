import { makeFunctionArgs } from "./functionconstruction";
import { withDesc, Desc } from "./describe";
import Observable from "./observable";

Observable.prototype.doEnd = function() {
  var f = makeFunctionArgs(arguments);
  return withDesc(new Desc(this, "doEnd", [f]), this.withHandler(function(event) {
    if (event.isEnd()) { f(); }
    return this.push(event);
  }));
};
