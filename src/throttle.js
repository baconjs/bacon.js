import "./buffer";
import "./delaychanges";
import "./map";
import Property from "./property";
import EventStream from "./eventstream";
import { withDesc, Desc } from "./describe";

EventStream.prototype.throttle = function (delay) {
  return withDesc(new Desc(this, "throttle", [delay]), this.bufferWithTime(delay).map((values) => values[values.length - 1]));
};

Property.prototype.throttle = function (delay) {
  return this.delayChanges(new Desc(this, "throttle", [delay]), (changes) => changes.throttle(delay));
};
