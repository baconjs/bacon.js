import './flatmap_'
import { handleEventValueWith } from "./flatmap_"
import Observable from "./observable";
import { Desc } from "./describe";

Observable.prototype.flatMapWithConcurrencyLimit = function(limit, f) {
  return this.flatMap_(
    handleEventValueWith(f),
    { 
      limit,
      desc: new Desc(this, "flatMapWithConcurrencyLimit", [limit, f])
    }
  )
};
