import Observable, { EventStream, Property } from "./observable";
import { Desc } from "./describe";
import { withLatestFrom } from "./withlatestfrom"
import _, { flip } from "./_"
import interval from "./interval";

type Combinator<V, V2, R> = (x: V, y: V2) => R;

function makeCombinator<V, V2, R>(combinator: Combinator<V, V2, R> | undefined): Combinator<V, V2, R> {
  if (typeof combinator == "function") {
    return combinator;
  } else {
    return <any>_.id
  }
}

/** @hidden */
export function sampledBy<V, V2, R>(samplee: Observable<V>, sampler: Observable<V2>, f: Combinator<V, V2, R>): Observable<R> {
  if (samplee instanceof EventStream) {
    return sampledByE(samplee, sampler, f)
  } else {
    return sampledByP(samplee as Property<V>, sampler, f)
  }
}

/** @hidden */
export function sampledByP<V, V2, R>(samplee: Property<V>, sampler: Observable<V2>, f: Combinator<V, V2, R>): Observable<R> {
  let combinator: (x: V, y: V2) => R = makeCombinator(f)
  var result = withLatestFrom(sampler, samplee, flip(combinator))
  return result.withDesc(new Desc(samplee, "sampledBy", [sampler]));
}

/** @hidden */
export function sampledByE<V, V2, R>(samplee: EventStream<V>, sampler: Observable<V2>, f: Combinator<V, V2, R>): Observable<R> {
  return sampledByP(samplee.toProperty(), sampler, f).withDesc(new Desc(samplee, "sampledBy", [sampler]));
}

/** @hidden */
export function sampleP<V>(samplee: Property<V>, samplingInterval: number): EventStream<V> {
  return <any>sampledByP(
    samplee,
    interval(samplingInterval, {}),
    (a, b) => a
  ).withDesc(new Desc(samplee, "sample", [samplingInterval]));
}
