import once from "./once";
import { Error } from "./event";
import Bacon from "./core";
import { EventStream } from "./observable";

export default function tryF<In, Out>(f: (In) => Out): (In) => EventStream<Out> {
  return function(value) {
    try {
      return once(f(value));
    } catch(e) {
      return once(new Error(e));
    }
  };
}

Bacon.try = tryF;
