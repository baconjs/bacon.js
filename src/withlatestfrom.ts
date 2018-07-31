import { EventStream } from "./observable";
import Observable from "./observable";
import { Property } from "./observable";;
import { DefaultSource } from "./internal/source";
import { Desc } from "./describe";
import { when, whenP } from "./when";
import { flip } from "./_"


/** @hidden */
export function withLatestFromE<V, V2, R>(sampler: EventStream<V>, samplee: Observable<V2>, f: (V, V2) => R): EventStream<R> {
  var result: EventStream<R> = <any>when([new DefaultSource(samplee.toProperty(), false), new DefaultSource(sampler, true), flip(f)]);
  return result.withDesc(new Desc(sampler, "withLatestFrom", [samplee, f]));
}

/** @hidden */
export function withLatestFromP<V, V2, R>(sampler: Property<V>, samplee: Observable<V2>, f: (V, V2) => R): Property<R> {
  var result: Property<R> = <any>whenP([new DefaultSource(samplee.toProperty(), false), new DefaultSource(sampler, true), flip(f)]);
  return result.withDesc(new Desc(sampler, "withLatestFrom", [samplee, f]));
}

/** @hidden */
export function withLatestFrom<V, V2, R>(sampler: Observable<V>, samplee: Observable<V2>, f: (V, V2) => R): Observable<R> {
  if (sampler instanceof Property) {
    return withLatestFromP(sampler, samplee, f)
  } else if (sampler instanceof EventStream) {
    return withLatestFromE(sampler, samplee, f)
  } else {
    throw new Error("Unknown observable: " + sampler)
  }
}

export default withLatestFrom