import Observable from "./observable";
import { assertObservableIsProperty } from "./helpers";
import { convertArgsToFunction } from "./functionconstruction";
import "./sample";
import "./filter";
import { endEvent } from "./event";
import { noMore } from "./reply";
import { withDesc, Desc } from "./describe";

Observable.prototype.takeWhile = function(f, ...args) {
  assertObservableIsProperty(f);
  return convertArgsToFunction(this, f, args, function(f) {
    return withDesc(new Desc(this, "takeWhile", [f]), this.withHandler(function(event) {
      if (event.filter(f)) {
        return this.push(event);
      } else {
        this.push(endEvent());
        return noMore;
      }
    }));
  });
};
