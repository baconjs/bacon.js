import "./filter";
import Observable from "./observable";
import { withDesc, Desc } from "./describe";

const alwaysFalse = () => false

Observable.prototype.errors = function() {
  return withDesc(new Desc(this, "errors", []), this.filter(alwaysFalse));
};
