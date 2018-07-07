import "./concat";
import "./scan";
import once from "./once";
import Property from "./property";
import EventStream from "./eventstream";
import { Desc } from "./describe";

Property.prototype.startWith = function(seed) {
  return this.scan(seed, (prev, next) => next).withDesc(new Desc(this, "startWith", [seed]));
};

EventStream.prototype.startWith = function(seed) {
  return once(seed).concat(this).withDesc(new Desc(this, "startWith", [seed]));
};
