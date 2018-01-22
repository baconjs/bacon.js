import "./take";
import { withDesc, Desc } from "./describe";
import Observable from "./observable";

Observable.prototype.first = function () {
  return withDesc(new Desc(this, "first", []), this.take(1));
};
