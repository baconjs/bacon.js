import { Desc } from "./describe";
import { handleEventValueWith, makeSpawner } from "./flatmap_"
import Observable from "./observable";

Observable.prototype.flatMap = function() {
  return this.flatMap_(
    handleEventValueWith(makeSpawner(arguments)), 
    { desc: new Desc(this, "flatMap", arguments) }
  );
};
