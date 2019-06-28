import "./combine";
import combineTemplate from "./combinetemplate";
import { Desc } from "./describe";
import { Observable, Property } from "./observable";

export type FlattenedObservable<O> = O extends Observable<infer I> ? I : O
export type DecodedValueOf<O> = FlattenedObservable<O[keyof O]>

/** @hidden */
export function decode<T extends Record<any, any>>(src: Observable<keyof T>, cases: T): Property<DecodedValueOf<T>> {
  return src.combine(combineTemplate<any>(cases), (key, values) => values[key])
    .withDesc(new Desc(src, "decode", [cases]));
}

export default decode
