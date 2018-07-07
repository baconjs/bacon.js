import './flatmap_'
import flatMap_, { handleEventValueWith } from "./flatmap_"
import Observable from "./observable";
import { Desc } from "./describe";

Observable.prototype.flatMapWithConcurrencyLimit = function(limit, f) {
  return flatMap_(
    handleEventValueWith(f),
    this,
    { 
      limit,
      desc: new Desc(this, "flatMapWithConcurrencyLimit", [limit, f])
    }
  )
};
