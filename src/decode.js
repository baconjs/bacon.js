import "./combine";
import combineTemplate from "./combinetemplate";
import { withDesc, Desc } from "./describe";
import Observable from "./observable";

Observable.prototype.decode = function(cases) {
  return withDesc(
    new Desc(this, "decode", [cases]),
    this.combine(combineTemplate(cases), (key, values) => values[key])
  );
};
