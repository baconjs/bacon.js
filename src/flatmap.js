import { Desc } from "./describe";
import { handleEventValueWith } from "./flatmap_"
import Observable from "./observable";

Observable.prototype.flatMap = function(f) {
  return this.flatMap_(
    handleEventValueWith(f),
    { desc: new Desc(this, "flatMap", arguments) }
  );
};
