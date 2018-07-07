import Observable from "./observable";
import { assertObservableIsProperty } from "./assert";
import { convertArgsToFunction } from "./functionconstruction";
import "./sample";
import "./filter";
import { endEvent } from "./event";
import { noMore } from "./reply";
import { Desc } from "./describe";

Observable.prototype.takeWhile = function(f, ...args) {
  assertObservableIsProperty(f);
  return convertArgsToFunction(this, f, args, function(f) {
    return this.withHandler(function (event) {
      if (event.filter(f)) {
        return this.push(event);
      } else {
        this.push(endEvent());
        return noMore;
      }
    }).withDesc(new Desc(this, "takeWhile", [f]));
  });
};
