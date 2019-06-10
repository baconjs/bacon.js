import './flatmap_'
import './flatmapconcat'
import './doaction'
import { makeObservable } from "./flatmap_"
import EventStream from "./eventstream";
// TODO: toString test, Desc
Bacon.EventStream.prototype.flatScan = function (seed, f) {
  var current;
  var isSeeded = false;
  
  if (typeof seed === "function") {
    return this.flatMapConcat(function (next) {
      return (isSeeded ? makeObservable(seed(current, next)) : makeObservable(next))
      .doAction(function (updated) {
        isSeeded = true;
        return current = updated;
      });
    }).toProperty();
  }
  
  current = seed;
  return this.flatMapConcat(next =>
    makeObservable(f(current, next)).doAction(updated => current = updated)
  ).toProperty(seed);
};