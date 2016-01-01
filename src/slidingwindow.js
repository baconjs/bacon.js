import "./scan";
import "./filter";
import { withDesc, Desc } from "./describe";
import Observable from "./observable";

Observable.prototype.slidingWindow = function(n, minValues = 0) {
  return withDesc(new Desc(this, "slidingWindow", [n, minValues]), this.scan([],
    (function(window, value) { return window.concat([value]).slice(-n); }))
      .filter((function(values) { return values.length >= minValues; })));
};
