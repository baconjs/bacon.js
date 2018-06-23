import "./filter";
import "./mapend";
import "./sample";
import "./scan";

import Observable from "./observable";
import { withDesc, Desc } from "./describe";

Observable.prototype.fold = function(seed, f) {
  return withDesc(
    new Desc(this, "fold", [seed, f]),
    this.scan(seed, f).sampledBy(this.errors().mapEnd().toProperty())
  );
};

Observable.prototype.reduce = Observable.prototype.fold;
