import "./maperror";
import "./flatmap";
import Observable from "./observable";
import once from "./once";
import { Error } from "./event";
import { withDesc, Desc } from "./describe";

Observable.prototype.flatMapError = function(fn) {
  var desc = new Desc(this, "flatMapError", [fn]);
  return withDesc(desc, this.mapError((err) => new Error(err)).flatMap((x) => {
    if (x instanceof Error) {
      return fn(x.error);
    } else {
      return once(x);
    }
  }));
};
