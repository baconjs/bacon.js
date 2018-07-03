import Observable from "./observable";

export function nop(): void {}

export const isArray: ((any) => boolean) = Array.isArray || function(xs) { return xs instanceof Array };

export function isObservable<T>(x): x is Observable<T> {
  return x && x._isObservable
}