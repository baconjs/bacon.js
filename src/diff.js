import "./filter";
import "./scan";
import "./map";
import { toCombinator } from "./functionconstruction";
import { Desc } from "./describe";
import Observable from "./observable";

Observable.prototype.diff = function(start, f) {
  f = toCombinator(f);
  return this.scan([start], function (prevTuple, next) {
    return [next, f(prevTuple[0], next)];
  })
    .filter(function (tuple) {
      return tuple.length === 2;
    })
    .map(function (tuple) {
      return tuple[1];
    }).withDesc(new Desc(this, "diff", [start, f]));
};
