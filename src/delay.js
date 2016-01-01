import "./flatmap";
import "./delaychanges";
import later from "./later";
import EventStream from "./eventstream";
import Property from "./property";
import { withDesc, Desc } from "./describe";

EventStream.prototype.delay = function(delay) {
  return withDesc(new Desc(this, "delay", [delay]), this.flatMap(function(value) {
    return later(delay, value);
  }));
};

Property.prototype.delay = function(delay) {
  return this.delayChanges(new Desc(this, "delay", [delay]), function(changes) {
    return changes.delay(delay);
  });
};
