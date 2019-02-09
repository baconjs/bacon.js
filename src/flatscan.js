import './flatmap_'
import './flatmapconcat'
import './doaction'
import { makeObservable } from "./flatmap_"
import EventStream from "./eventstream";
// TODO: toString test, Desc
EventStream.prototype.flatScan = function(seed, f) {
  let current = seed
  return this.flatMapConcat(next =>
    makeObservable(f(current, next)).doAction(updated => current = updated)
  ).toProperty(seed)
}
