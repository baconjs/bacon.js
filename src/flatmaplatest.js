import "./flatmap";
import "./takeuntil";

import { makeSpawner, makeObservable } from "./flatmap_";
import Observable from "./observable";
import { withDesc, Desc } from "./describe";

Observable.prototype.flatMapLatest = function() {
  var f = makeSpawner(arguments);
  var stream = this.toEventStream();
  return withDesc(new Desc(this, "flatMapLatest", [f]), stream.flatMap(function(value) {
    return makeObservable(f(value)).takeUntil(stream);
  }));
};
