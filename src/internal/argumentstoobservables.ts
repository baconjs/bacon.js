import _ from "../_";
import { isArray, isObservable } from "../helpers";
import Observable from "../observable";
import constant from "../constant"

/** @hidden */
export function argumentsToObservables<T>(args: (Observable<T> | Observable<T>[] | T)[]): Observable<T>[] {
  args = <any>(Array.prototype.slice.call(args))
  return _.flatMap(<any>singleToObservables, <any>args)
}

function singleToObservables<T>(x: (Observable<T> | Observable<T>[] | T)): Observable<T>[] {
  if (isObservable<T>(x)) {
    return [x]
  } else if (isArray(x)) {
    return argumentsToObservables(<any>x)
  } else {
    return <any>[constant(x)]
  }
}

/** @hidden */
export function argumentsToObservablesAndFunction<V>(args: IArguments): [Observable<any>[], (...args: any[]) => V] {
  if (_.isFunction(args[0])) {
    return [argumentsToObservables(Array.prototype.slice.call(args, 1)), args[0]];
  } else {
    return [argumentsToObservables(<any>Array.prototype.slice.call(args, 0, args.length - 1)), _.last(<any>args) ];
  }
}
