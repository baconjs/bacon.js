import once from "./once";
import { Error } from "./event";
import Bacon from "./core";

export default function tryF(f) {
  return function(value) {
    try {
      return once(f(value));
    } catch(e) {
      return new Error(e);
    }
  };
}

Bacon.try = tryF;
