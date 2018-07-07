import "./filter";
import "./mapend";
import "./sample";
import "./scan";

import Observable from "./observable";
import { Desc } from "./describe";

Observable.prototype.fold = function(seed, f) {
  return this.scan(seed, f).sampledBy(this.errors().mapEnd().toProperty()).withDesc(new Desc(this, "fold", [seed, f]));
};

Observable.prototype.reduce = Observable.prototype.fold;
