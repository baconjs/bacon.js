import { handleEventValueWith } from "./flatmap_"
import { Desc } from "./describe";
import Observable from "./observable";
import flatMap_ from "./flatmap_"

Observable.prototype.flatMapFirst = function(f) {
  return flatMap_(
    handleEventValueWith(f),
    this,
    {
      firstOnly: true,
      desc: new Desc(this, "flatMapFirst", arguments)
    }
  );
};
