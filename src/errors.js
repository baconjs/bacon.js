import "./filter";
import Observable from "./observable";
import { withDesc, Desc } from "./describe";

Observable.prototype.errors = function() {
  return withDesc(new Desc(this, "errors", []), this.filter(function() {
    return false;
  }));
};
