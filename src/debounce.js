import EventStream from "./eventstream";
import Property from "./property";
import { withDesc, Desc } from "./describe";
import "./flatmaplatest";
import "./delay";
import "./filter";
import "./concat";
import once from "./once";
import later from "./later";
import Bacon from "./core";

EventStream.prototype.debounce = function(delay) {
  return withDesc(new Desc(this, "debounce", [delay]), this.flatMapLatest(function(value) {
    return Bacon.later(delay, value);
  }));
};

Property.prototype.debounce = function(delay) {
  return this.delayChanges(new Desc(this, "debounce", [delay]), function(changes) {
    return changes.debounce(delay);
  });
};

EventStream.prototype.debounceImmediate = function(delay) {
  return withDesc(new Desc(this, "debounceImmediate", [delay]), this.flatMapFirst(function(value) {
    return once(value).concat(later(delay).filter(false));
  }));
};
