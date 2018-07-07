import "./flatmapwithconcurrencylimit";
import Observable from "./observable";
import { Desc } from "./describe";

Observable.prototype.flatMapConcat = function() {
  var desc = new Desc(this, "flatMapConcat", Array.prototype.slice.call(arguments, 0));
  return this.flatMapWithConcurrencyLimit(1, ...arguments).withDesc(desc);
};
