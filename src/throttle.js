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
      changes.flatMapFirst(first => {
        let holding;
        const flushHolding = () => {
          const flushing = holding ? [holding] : [];
          holding = null;
          return Bacon.fromArray(flushing);
        };
        const silence = Bacon.once()
          .concat(this.doAction(value => holding = value))
          .flatMapLatest(() => Bacon.later(delay, true))
          .take(1);
        const sampler = Bacon.interval(delay).takeUntil(silence);
        return Bacon.once(first).concat(sampler.flatMap(flushHolding));
      })
  );
};
