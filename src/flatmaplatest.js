import "./flatmap";
import "./takeuntil";

import { makeObservable } from "./flatmap_";
import Observable from "./observable";
import { Desc } from "./describe";
import { allowSync } from "./eventstream";
import _ from "./_"

Observable.prototype.flatMapLatest = function(f) {
  f = _.toFunction(f)
  var stream = this._isProperty ? this.toEventStream(allowSync) : this;
  let flatMapped = stream.flatMap(function(value) {
    return makeObservable(f(value)).takeUntil(stream);
  })
  if (this._isProperty) flatMapped = flatMapped.toProperty()
  return flatMapped.withDesc(new Desc(this, "flatMapLatest", [f]));
};
