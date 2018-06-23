import EventStream from "./eventstream";
import Observable from "./observable";
import Property from "./property";
import { former } from "./helpers";
import { Source } from "./source";
import { toCombinator } from "./functionconstruction";
import { withDesc, Desc } from "./describe";
import { when, whenP } from "./when";
import map from "./map";
import Bacon from "./core";
import { withLatestFromE, withLatestFromP } from "./withlatestfrom"
import _ from "./_"

const makeCombinator = (combinator) => {
  if ((typeof combinator !== "undefined" && combinator !== null)) {
    return toCombinator(combinator);
  } else {
    return Bacon._.id
  }
}

EventStream.prototype.sampledBy = function(sampler, combinator) {
  return withDesc(
    new Desc(this, "sampledBy", [sampler, combinator]),
    this.toProperty().sampledBy(sampler, combinator));
};

Property.prototype.sampledBy = function(sampler, combinator) {
  combinator = makeCombinator(combinator)
  var result = sampler._isProperty
    ? withLatestFromP(sampler, this, _.flip(combinator))
    : withLatestFromE(sampler, this, _.flip(combinator))
  return withDesc(new Desc(this, "sampledBy", [sampler, combinator]), result);
};

Property.prototype.sample = function(interval) {
  return withDesc(
    new Desc(this, "sample", [interval]),
    this.sampledBy(Bacon.interval(interval, {})));
};
