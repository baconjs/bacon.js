import _ from './_';
import Exception from './exception';
import { isArray } from "./helpers";

export function assert(message, condition) {
  if (!condition) {
    throw new Exception(message);
  }
}

export function assertObservableIsProperty(x) {
  if ((x != null ? x._isObservable : void 0) && !(x != null ? x._isProperty : void 0)) {
    throw new Exception("Observable is not a Property : " + x);
  }
}
export function assertEventStream(event) {
  if (!(event != null ? event._isEventStream : void 0)) {
    throw new Exception("not an EventStream : " + event);
  }
}

export function assertObservable(observable) {
  if (!(observable != null ? observable._isObservable : void 0)) {
    throw new Exception("not an Observable : " + observable);
  }
}

export function assertFunction(f) {
  return assert("not a function : " + f, _.isFunction(f));
}

export function assertArray(xs) {
  if (!isArray(xs)) {
    throw new Exception("not an array : " + xs);
  }
}
export function assertNoArguments(args) {
  return assert("no arguments supported", args.length === 0);
}

export function assertString(x) {
  if (typeof x === "string") {
    throw new Exception("not a string : " + x);
  }
}