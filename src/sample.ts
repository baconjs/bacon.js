import EventStream from "./eventstream";
import Property from "./property";
import { toCombinator } from "./functionconstruction";
import { Desc } from "./describe";
import Bacon from "./core";
import { withLatestFrom } from "./withlatestfrom"
import { flip } from "./_"
import Observable from "./observable";

const makeCombinator = (combinator) => {
  if ((typeof combinator !== "undefined" && combinator !== null)) {
    return toCombinator(combinator);
  } else {
    return Bacon._.id
  }
}

export function sampledByP<V, V2, R>(samplee: Property<V>, sampler: Observable<V2>, f: (V, V2) => R): Observable<R> {
  let combinator: (V, V2) => R = makeCombinator(f)
  var result = withLatestFrom(sampler, samplee, flip(combinator))
  return result.withDesc(new Desc(samplee, "sampledBy", [sampler, combinator]));
}

export function sampledByE<V, V2, R>(samplee: EventStream<V>, sampler: Observable<V2>, f: (V, V2) => R): Observable<R> {
  return sampledByP(samplee.toProperty(), sampler, f).withDesc(new Desc(samplee, "sampledBy", [sampler, f]));
}

export function sampleP<V>(samplee: Property<V>, interval: number): EventStream<V> {
  return <any>sampledByP(
    samplee,
    Bacon.interval(interval, {}),
    (a, b) => a
  ).withDesc(new Desc(samplee, "sample", [interval]));
}