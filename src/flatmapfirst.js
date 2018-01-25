import { makeSpawner, handleEventValueWith } from "./flatmap_"
import { Desc } from "./describe";
import Observable from "./observable";

Observable.prototype.flatMapFirst = function() {
  return this.flatMap_(
    handleEventValueWith(makeSpawner(arguments)), 
    {
      firstOnly: true,
      desc: new Desc(this, "flatMapFirst", arguments)
    }
  );
};
