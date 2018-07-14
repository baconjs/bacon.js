import "./flatmap";
import later from "./later";
import Observable from "./observable";
import { Desc } from "./describe";

Observable.prototype.delay = function(delay) { 
  return this.delayChanges(new Desc(this, "delay", [delay]), function(changes) { 
    return changes.flatMap(function(value) {
      return later(delay, value);
    })
  })
}
