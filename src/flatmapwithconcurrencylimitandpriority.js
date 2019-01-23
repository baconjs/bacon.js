import './flatmap_'
import { makeSpawner, handleEventValueWith } from "./flatmap_"
import Observable from "./observable";
import { Desc } from "./describe";

Observable.prototype.flatMapWithConcurrencyLimitAndPriority = function(limit, compareFn, ...args) {
  return this.flatMap_(
    handleEventValueWith(makeSpawner(args)), 
    { 
      limit,
       compareFn,
      desc: new Desc(this, "flatMapWithConcurrencyLimitAndPriority", [limit, compareFn, ...args])
    }
  )
};
