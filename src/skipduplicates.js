import "./withstatemachine";
import { Some, None } from "./optional";
import { withDesc, Desc } from "./describe";
import Observable from "./observable";

var equals = function(a, b) { return a === b; };

var isNone = function(object){
  return ((typeof object !== "undefined" && object !== null) ? object._isNone : false)
};

Observable.prototype.skipDuplicates = function(isEqual = equals) {
  var desc = new Desc(this, "skipDuplicates", []);
  return withDesc(desc, this.withStateMachine(None, function(prev, event) {
    if (!event.hasValue()) {
      return [prev, [event]];
    } else if (event.isInitial() || isNone(prev) || !isEqual(prev.get(), event.value)) {
      return [new Some(event.value), [event]];
    } else {
      return [prev, []];
    }
  }));
};
