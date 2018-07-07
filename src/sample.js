import EventStream from "./eventstream";
import Property from "./property";
import { toCombinator } from "./functionconstruction";
import { Desc } from "./describe";
import Bacon from "./core";
import { withLatestFrom } from "./withlatestfrom"
import _ from "./_"

const makeCombinator = (combinator) => {
  if ((typeof combinator !== "undefined" && combinator !== null)) {
    return toCombinator(combinator);
  } else {
    return Bacon._.id
  }
}

EventStream.prototype.sampledBy = function(sampler, combinator) {
  return this.toProperty().sampledBy(sampler, combinator).withDesc(new Desc(this, "sampledBy", [sampler, combinator]));
};

Property.prototype.sampledBy = function(sampler, combinator) {
  combinator = makeCombinator(combinator)
  var result = withLatestFrom(sampler, this, _.flip(combinator))
  return result.withDesc(new Desc(this, "sampledBy", [sampler, combinator]));
};

Property.prototype.sample = function(interval) {
  return this.sampledBy(Bacon.interval(interval, {})).withDesc(new Desc(this, "sample", [interval]));
};
