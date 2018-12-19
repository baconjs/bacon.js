import _ from '../_';
import Exception from '../exception';
import { isArray } from "../helpers";

/** @hidden */
export function assert(message: string, condition: boolean) {
  if (!condition) {
    throw new Exception(message);
  }
}

/** @hidden */
export function assertObservableIsProperty(x: any) {
  if ((x != null ? x._isObservable : void 0) && !(x != null ? x._isProperty : void 0)) {
    throw new Exception("Observable is not a Property : " + x);
  }
}

/** @hidden */
export function assertEventStream(event: any) {
  if (!(event != null ? event._isEventStream : void 0)) {
    throw new Exception("not an EventStream : " + event);
  }
}

/** @hidden */
export function assertObservable(observable: any) {
  if (!(observable != null ? observable._isObservable : void 0)) {
    throw new Exception("not an Observable : " + observable);
  }
}

/** @hidden */
export function assertFunction(f: Function | undefined) {
  return assert("not a function : " + f, _.isFunction(f));
}

/** @hidden */
export function assertArray(xs: any[]) {
  if (!isArray(xs)) {
    throw new Exception("not an array : " + xs);
  }
}

/** @hidden */
export function assertNoArguments(args: IArguments) {
  return assert("no arguments supported", args.length === 0);
}
