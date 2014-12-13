import Observable from "./classes/Observable";

export default function isObservable(x) {
  return x instanceof Observable;
}