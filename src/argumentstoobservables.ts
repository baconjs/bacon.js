import _ from "./_";
import { isArray, isObservable } from "./helpers";
import Observable from "./observable";
import constant from "./constant"

export function argumentsToObservables<T>(args: (Observable<T> | Observable<T>[] | T)[]): Observable<T>[] {
  args = Array.prototype.slice.call(args)
  return _.flatMap(singleToObservables, args)
}

function singleToObservables<T>(x: (Observable<T> | Observable<T>[] | T)): Observable<T>[] {
  if (isObservable(x)) {
    return [x]
  } else if (isArray(x)) {
    return argumentsToObservables(<any>x)
  } else {
    return [constant(x)]
  }
}

export function argumentsToObservablesAndFunction(args) {
  if (_.isFunction(args[0])) {
    return [argumentsToObservables(Array.prototype.slice.call(args, 1)), args[0]];
  } else {
    return [argumentsToObservables(Array.prototype.slice.call(args, 0, args.length - 1)), _.last(args) ];
  }
}
