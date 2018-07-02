import "./maperror";
import "./flatmap";
import Observable from "./observable";
import { Error } from "./event";
import { Desc } from "./describe";
import flatMap_ from "./flatmap_"

Observable.prototype.flatMapError = function(fn) {
  return flatMap_(
    (x) => {
      if (x instanceof Error) {
        return fn(x.error);
      } else {
        return x;
      }
    },
    this,
    { 
      mapError: true,
      desc: new Desc(this, "flatMapError", [fn])
    }
  )
};
