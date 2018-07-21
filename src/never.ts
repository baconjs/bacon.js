import { EventStream } from "./observable";
import { endEvent } from "./event";
import { describe } from "./describe";
import { nop } from "./helpers";

export default function never<V>(): EventStream<V> {
  return new EventStream<V>(describe("Bacon", "never"), (sink) => {
    sink(endEvent());
    return nop;
  });
}
