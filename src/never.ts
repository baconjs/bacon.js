import { EventStream } from "./observable";
import { endEvent } from "./event";
import { describe } from "./describe";
import { nop } from "./helpers";

/**
 Creates an EventStream that immediately ends.
 @typeparam V Type of stream elements
 */
export default function never<V>(): EventStream<V> {
  return new EventStream<V>(describe("Bacon", "never"), (sink) => {
    sink(endEvent());
    return nop;
  });
}
