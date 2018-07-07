import "./combine";
import combineTemplate from "./combinetemplate";
import { Desc } from "./describe";
import Observable from "./observable";

Observable.prototype.decode = function(cases) {
  return this.combine(combineTemplate(cases), (key, values) => values[key]).withDesc(new Desc(this, "decode", [cases]));
};
