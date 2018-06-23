import { Desc } from "./describe";
import "./flatmaplatest";
import "./delay";
import "./filter";
import "./concat";
import Observable from "./observable"
import later from "./later"
import once from "./once"

Observable.prototype.debounce = function(delay) { 
  return this.delayChanges(new Desc(this, "debounce", [delay]), function(changes) { 
    return changes.flatMapLatest(function(value) {
      return later(delay, value)
    })
  })
}
Observable.prototype.debounceImmediate = function(delay) { 
  return this.delayChanges(new Desc(this, "debounceImmediate", [delay]), function(changes) { 
    return changes.flatMapFirst(function(value) {
      return once(value).concat(later(delay).errors());
    })
  })
}
