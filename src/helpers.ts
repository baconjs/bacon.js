import Observable from "./observable";

/** @hidden */
export function nop(): void {}

/** @hidden */
export const isArray: ((x: any) => boolean) = Array.isArray || function(xs) { return xs instanceof Array };

/** @hidden */
export function isObservable<T>(x: any): x is Observable<T> {
  return x && x._isObservable
}
