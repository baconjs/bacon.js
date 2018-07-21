import { Desc } from "./describe";
import { extractRawPatterns, when } from "./when";
import "./scan";
import Bacon from "./core";
import Observable, { Property } from "./observable";

export type UpdatePattern1<I1,O> = [Observable<I1>, (O, I1) => O]
export type UpdatePattern2<I1,I2,O> = [Observable<I1>, Observable<I1>, (O, I1, I2) => O]
export type UpdatePattern3<I1,I2,I3,O> = [Observable<I1>, Observable<I1>, Observable<I3>, (O, I1, I2, I3) => O]
export type UpdatePattern4<I1,I2,I3,I4,O> = [Observable<I1>, Observable<I1>, Observable<I3>, Observable<I4>, (O, I1, I2, I3, I4) => O]
export type UpdatePattern5<I1,I2,I3,I4,I5,O> = [Observable<I1>, Observable<I1>, Observable<I3>, Observable<I4>, Observable<I5>, (O, I1, I2, I3, I4, I5) => O]
export type UpdatePattern6<I1,I2,I3,I4,I5,I6,O> = [Observable<I1>, Observable<I1>, Observable<I3>, Observable<I4>, Observable<I5>, Observable<I6>, (O, I1, I2, I3, I4, I5, I6) => O]
export type UpdatePattern<O> =
  UpdatePattern1<any, O> |
  UpdatePattern2<any, any, O> |
  UpdatePattern3<any, any, any, O> |
  UpdatePattern4<any, any, any, any, O> |
  UpdatePattern5<any, any, any, any, any, O> |
  UpdatePattern6<any, any, any, any, any, any, O>

export default function update<Out>(initial, ...patterns: UpdatePattern<Out>[]): Property<Out> {
  let rawPatterns = extractRawPatterns(<any>patterns)

  for (var i = 0; i < rawPatterns.length; i++) {
    let pattern = rawPatterns[i];
    pattern[1] = lateBindFirst(pattern[1])
  }

  return when(...rawPatterns).scan(initial, (function (x, f: Function) {
    return f(x)
  })).withDesc(new Desc(Bacon, "update", [initial, ...patterns]))
}

Bacon.update = update;

function lateBindFirst(f) {
  return function(...args) {
    return function(i) {
      return f(...[i].concat(args))
    }
  }
}