import Exception from "./exception";
import Observable from "./observable";
import { noMore } from "./reply";
import "./last";

declare var Promise: any

/** @hidden */
export function firstToPromise<V>(src: Observable<V>, PromiseCtr: Function | undefined): Promise<V> {
  // Can't do in the global scope, as shim can be applied after Bacon is loaded.
  if (typeof PromiseCtr !== "function") {
    if (typeof Promise === "function") {
      PromiseCtr = f => new Promise(f);
    } else {
      throw new Exception("There isn't default Promise, use shim or parameter");
    }
  }

  return new (<any>PromiseCtr)((resolve, reject) =>
    src.subscribe((event) => {
      if (event.hasValue) { resolve(event.value); }
      if (event.isError) { reject(event.error); }
      // One event is enough
      return noMore;
    }));
};

/** @hidden */
export function toPromise<V>(src: Observable<V>, PromiseCtr): Promise<V> {
  return src.last().firstToPromise(PromiseCtr);
};
