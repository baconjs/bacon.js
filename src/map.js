import { withDesc, Desc } from "./describe";
import { convertArgsToFunction } from "./functionconstruction";
import Observable from "./observable";

export default function map(p, ...args) {
  return convertArgsToFunction(this, p, args, function(f) {
    return withDesc(new Desc(this, "map", [f]), this.withHandler(function(event) {
      return this.push(event.fmap(f));
    }));
  });
}

Observable.prototype.map = map;
