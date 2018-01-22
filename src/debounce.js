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

Bacon.Observable.prototype.debounce = function(delay) { 
  return this.delayChanges(new Desc(this, "debounce", [delay]), function(changes) { 
    return changes.flatMapLatest(function(value) {
      return Bacon.later(delay, value)
    })
  })
}
Bacon.Observable.prototype.debounceImmediate = function(delay) { 
  return this.delayChanges(new Desc(this, "debounceImmediate", [delay]), function(changes) { 
    return changes.flatMapFirst(function(value) {
      return Bacon.once(value).concat(Bacon.later(delay).filter(false));
    })
  })
}
