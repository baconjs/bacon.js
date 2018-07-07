import './flatmap_'
import './doaction'
import { makeObservable } from "./flatmap_"
import Observable from "./observable";
// TODO: toString test, Desc
Observable.prototype.flatScan = function(seed, f) {
  let current = seed
  return this.flatMapConcat(next =>
    makeObservable(f(current, next)).doAction(updated => current = updated)
  ).toProperty(seed)
}
