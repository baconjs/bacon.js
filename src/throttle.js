import "./buffer";
import "./delaychanges";
import "./map";
import Observable from "./observable";
import { Desc } from "./describe";

Observable.prototype.throttle = function (delay) {
  return this.delayChanges(new Desc(this, "throttle", [delay]), (changes) => changes.bufferWithTime(delay).map((values) => values[values.length - 1]));
};
