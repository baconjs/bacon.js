import "./scan";
import "./filter";
import { Desc } from "./describe";
import Observable from "./observable";

Observable.prototype.slidingWindow = function(n, minValues = 0) {
  return this.scan([],
    (function (window, value) {
      return window.concat([value]).slice(-n);
    }))
    .filter((function (values) {
      return values.length >= minValues;
    })).withDesc(new Desc(this, "slidingWindow", [n, minValues]));
};
