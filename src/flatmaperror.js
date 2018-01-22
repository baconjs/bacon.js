import "./maperror";
import "./flatmap";
import Observable from "./observable";
import once from "./once";
import { Error } from "./event";
import { withDesc, Desc } from "./describe";

Observable.prototype.flatMapError = function(fn) {
  return this.flatMap_(
    (x) => {
      if (x instanceof Error) {
        return fn(x.error);
      } else {
        return x;
      }
    }, 
    { 
      mapError: true,
      desc: new Desc(this, "flatMapError", [fn])
    }
  )
};
