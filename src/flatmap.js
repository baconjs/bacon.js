import { Desc } from "./describe";
import { handleEventValueWith } from "./flatmap_"
import Observable from "./observable";
import flatMap_ from "./flatmap_"

Observable.prototype.flatMap = function(f) {
  return flatMap_(
    handleEventValueWith(f),
    this,
    { desc: new Desc(this, "flatMap", arguments) }
  );
};
