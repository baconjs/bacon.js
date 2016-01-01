import { makeSpawner, flatMap_ } from "./flatmap";
import Observable from "./observable";
import { withDesc, Desc } from "./describe";

Observable.prototype.flatMapWithConcurrencyLimit = function(limit, ...args) {
  var desc = new Desc(this, "flatMapWithConcurrencyLimit", [limit, ...args]);
  return withDesc(desc, flatMap_(this, makeSpawner(args), false, limit));
};
