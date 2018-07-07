import "./filter";
import "./flatmapconcat";
import "./concat";
import Observable from "./observable";
import Property from "./property";
import later from "./later";
import once from "./once";
import { Desc } from "./describe";

Observable.prototype.bufferingThrottle = function(minimumInterval) {
  var desc = new Desc(this, "bufferingThrottle", [minimumInterval]);
  return this.flatMapConcat((x) => {
    return once(x).concat(later(minimumInterval).errors());
  }).withDesc(desc);
};

Property.prototype.bufferingThrottle = function() {
  return Observable.prototype.bufferingThrottle.apply(this, arguments).toProperty();
};
