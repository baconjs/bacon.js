import "./buffer";
import "./delaychanges";
import "./map";
import Observable from "./observable";
import { Desc } from "./describe";
import Bacon from "./core";

Observable.prototype.throttle = function (delay) {
  return this.delayChanges(new Desc(this, "throttle", [delay]), (changes) => 
    changes
      .bufferWithTime(delay)
      .map((values) => values[values.length - 1]));
};
Observable.prototype.throttleImmediate = function (delay) {
  return this.delayChanges(new Desc(this, "throttleImmediate", [delay]), (changes) => 
    Bacon.mergeAll(
      changes.debounceImmediate(delay),
      changes.debounce(delay)
    )
    /*changes.flatMapFirst(value =>
      Bacon.once(value).concat(Bacon.later(delay).filter(false))
    )*/
  );
};
