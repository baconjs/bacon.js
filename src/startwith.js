import "./concat";
import "./scan";
import once from "./once";
import Property from "./property";
import EventStream from "./eventstream";
import { withDesc, Desc } from "./describe";

Property.prototype.startWith = function(seed) {
  return withDesc(new Desc(this, "startWith", [seed]),
    this.scan(seed, (prev, next) => next));
};

EventStream.prototype.startWith = function(seed) {
  return withDesc(new Desc(this, "startWith", [seed]),
    once(seed).concat(this));
};
