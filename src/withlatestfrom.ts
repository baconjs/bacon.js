import EventStream from "./eventstream";
import Observable from "./observable";
import Property from "./property";
import { DefaultSource } from "./source";
import { withDesc, Desc } from "./describe";
import { when, whenP } from "./when";
import _ from "./_"

export function withLatestFromE<V, V2, R>(sampler: EventStream<V>, samplee: Observable<V2>, f: (V, V2) => R): EventStream<R> {
  var result = when([new DefaultSource(samplee.toProperty(), false), new DefaultSource(sampler, true)], _.flip(f));
  return withDesc(new Desc(sampler, "withLatestFrom", [samplee, f]), result);
}

export function withLatestFromP<V, V2, R>(sampler: Property<V>, samplee: Observable<V2>, f: (V, V2) => R): Property<R> {
  var result = whenP([new DefaultSource(samplee.toProperty(), false), new DefaultSource(sampler, true)], _.flip(f));
  return withDesc(new Desc(sampler, "withLatestFrom", [samplee, f]), result);
}

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