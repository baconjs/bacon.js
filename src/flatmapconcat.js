import "./flatmapwithconcurrencylimit";
import Observable from "./observable";
import { withDesc, Desc } from "./describe";

Observable.prototype.flatMapConcat = function() {
  var desc = new Desc(this, "flatMapConcat", Array.prototype.slice.call(arguments, 0));
  return withDesc(desc, this.flatMapWithConcurrencyLimit(1, ...arguments));
};
