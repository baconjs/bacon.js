import once from "./once";
import { Error } from "./event";
import { EventStream } from "./observable";

/** @hidden */
export default function tryF<In, Out>(f: (value: In) => Out): (value: In) => EventStream<Out> {
  return function(value) {
    try {
      return once(f(value));
    } catch(e) {
      return once(new Error(e));
    }
  };
}
