// TODO: this one doesn't type very well. Takes n observables and an a-any function.
// maybe make use of typed tuples?
import Bacon from "./core";

export function onValues() {
  return Bacon.combineAsArray(
    Array.prototype.slice.call(arguments, 0, arguments.length - 1)
  ).onValues(arguments[arguments.length - 1]);
};

Bacon.onValues = onValues