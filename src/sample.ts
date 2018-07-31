import Observable, { EventStream, Property } from "./observable";
import { Desc } from "./describe";
import { withLatestFrom } from "./withlatestfrom"
import _, { flip } from "./_"
import interval from "./interval";

const makeCombinator = (combinator) => {
  if ((typeof combinator !== "undefined" && combinator !== null)) {
    return combinator;
  } else {
    return _.id
  }
}

/** @hidden */
export function sampledByP<V, V2, R>(samplee: Property<V>, sampler: Observable<V2>, f: (V, V2) => R): Observable<R> {
  let combinator: (V, V2) => R = makeCombinator(f)
  var result = withLatestFrom(sampler, samplee, flip(combinator))
  return result.withDesc(new Desc(samplee, "sampledBy", [sampler, combinator]));
}

/** @hidden */
export function sampledByE<V, V2, R>(samplee: EventStream<V>, sampler: Observable<V2>, f: (V, V2) => R): Observable<R> {
  return sampledByP(samplee.toProperty(), sampler, f).withDesc(new Desc(samplee, "sampledBy", [sampler, f]));
}

/** @hidden */
export function sampleP<V>(samplee: Property<V>, samplingInterval: number): EventStream<V> {
  return <any>sampledByP(
    samplee,
    interval(samplingInterval, {}),
    (a, b) => a
  ).withDesc(new Desc(samplee, "sample", [samplingInterval]));
}