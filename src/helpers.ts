export function nop(): void {}

export const isArray = Array.isArray || function(xs) { return xs instanceof Array };

export function isObservable(x) {
  return x && x._isObservable
}