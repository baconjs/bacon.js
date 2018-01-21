import './flatmap_'
import './flatmapconcat'
import './doaction'
import { makeObservable } from "./flatmap_"
import Observable from "./observable";
import { Desc } from "./describe";

Observable.prototype.flatScan = function(seed, f) {
  let current = seed
  return this.flatMapConcat(next =>
    makeObservable(f(current, next)).doAction(updated => current = updated)
  ).toProperty(seed)
}
