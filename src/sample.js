import EventStream from "./eventstream";
import Observable from "./observable";
import Property from "./property";
import { former } from "./helpers";
import { Source } from "./source";
import { toCombinator } from "./functionconstruction";
import { withDesc, Desc } from "./describe";
import map from "./map";
import when from "./when";
import Bacon from "./core";

EventStream.prototype.sampledBy = function(sampler, combinator) {
  return withDesc(
    new Desc(this, "sampledBy", [sampler, combinator]),
    this.toProperty().sampledBy(sampler, combinator));
};

Property.prototype.sampledBy = function(sampler, combinator) {
  var lazy = false;
  if ((typeof combinator !== "undefined" && combinator !== null)) {
    combinator = toCombinator(combinator);
  } else {
    lazy = true;
    combinator = function(f) { return f.value(); };
  }
  var thisSource = new Source(this, false, lazy);
  var samplerSource = new Source(sampler, true, lazy);
  var stream = when([thisSource, samplerSource], combinator);
  var result = sampler._isProperty ? stream.toProperty() : stream;
  return withDesc(new Desc(this, "sampledBy", [sampler, combinator]), result);
};

Property.prototype.sample = function(interval) {
  return withDesc(
    new Desc(this, "sample", [interval]),
    this.sampledBy(Bacon.interval(interval, {})));
};

Observable.prototype.map = function(p) {
  if (p && p._isProperty) {
    return p.sampledBy(this, former);
  } else {
    return map.apply(this, arguments);
  }
};
