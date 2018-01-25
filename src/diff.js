import "./filter";
import "./scan";
import "./map";
import { toCombinator } from "./functionconstruction";
import { withDesc, Desc } from "./describe";
import Observable from "./observable";

Observable.prototype.diff = function(start, f) {
  f = toCombinator(f);
  return withDesc(
    new Desc(this, "diff", [start, f]),
    this.scan([start], function(prevTuple, next) { return [next, f(prevTuple[0], next)]; })
      .filter(function(tuple) { return tuple.length === 2; })
      .map(function(tuple) { return tuple[1]; }));
};
