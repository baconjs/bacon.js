import './flatmap_'
import { makeSpawner, handleEventValueWith } from "./flatmap_"
import Observable from "./observable";
import { Desc } from "./describe";

Observable.prototype.flatMapWithConcurrencyLimit = function(limit, ...args) {
  return this.flatMap_(
    handleEventValueWith(makeSpawner(args)), 
    { 
      limit,
      desc: new Desc(this, "flatMapWithConcurrencyLimit", [limit, ...args])
    }
  )
};
