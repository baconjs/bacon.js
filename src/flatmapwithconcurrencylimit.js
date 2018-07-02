import './flatmap_'
import { handleEventValueWith } from "./flatmap_"
import Observable from "./observable";
import { Desc } from "./describe";
import flatMap_ from "./flatmap_"

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
