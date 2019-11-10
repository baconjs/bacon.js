import Exception from "./exception";
import Observable from "./observable";
import { noMore } from "./reply";
import { isError, hasValue } from "./event";
import "./last";

declare var Promise: any

/** @hidden */
export function firstToPromise<V>(src: Observable<V>, PromiseCtr: Function | undefined): Promise<V> {
  const
    generator = (resolve: ((v: V) => {}), reject: ((e: any) => {})) =>
      src.subscribe((event) => {
        if (hasValue(event)) { resolve(event.value); }
        if (isError(event)) { reject(event.error); }
        // One event is enough
        return noMore;
      });

  // Can't do in the global scope, as shim can be applied after Bacon is loaded.
  if (typeof PromiseCtr === "function") {
    return new (<any>PromiseCtr)(generator);
  }
  else if (typeof Promise === "function") {
    return new Promise(generator);
  }
  else {
    throw new Exception("There isn't default Promise, use shim or parameter");
  }
};

/** @hidden */
export function toPromise<V>(src: Observable<V>, PromiseCtr: Function | undefined): Promise<V> {
  return src.last().firstToPromise(PromiseCtr);
};
