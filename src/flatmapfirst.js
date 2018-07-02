import { handleEventValueWith } from "./flatmap_"
import { Desc } from "./describe";
import Observable from "./observable";

Observable.prototype.flatMapFirst = function(f) {
  return this.flatMap_(
    handleEventValueWith(f),
    {
      firstOnly: true,
      desc: new Desc(this, "flatMapFirst", arguments)
    }
  );
};
