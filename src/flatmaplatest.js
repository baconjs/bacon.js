import "./flatmap";
import "./takeuntil";

import { makeSpawner, makeObservable } from "./flatmap_";
import Observable from "./observable";
import { withDesc, Desc } from "./describe";
import { allowSync } from "./eventstream";

Observable.prototype.flatMapLatest = function() {
  var f = makeSpawner(arguments);
  var stream = this._isProperty ? this.toEventStream(allowSync) : this;
  let flatMapped = stream.flatMap(function(value) {
    return makeObservable(f(value)).takeUntil(stream);
  })
  if (this._isProperty) flatMapped = flatMapped.toProperty()
  return withDesc(new Desc(this, "flatMapLatest", [f]), flatMapped);
};
