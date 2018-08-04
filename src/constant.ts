import { Property } from "./observable";;
import { Desc } from "./describe";
import { endEvent, initialEvent } from "./event";
import { nop } from "./helpers";
import { EventSink } from "./types";

/**
 Creates a constant property with value `x`.
 */
export default function constant<V>(x: V) {
  return new Property<V>(new Desc("Bacon", "constant", [x]), function(sink : EventSink<V>) {
    sink(initialEvent(x));
    sink(endEvent());
    return nop;
  });
}
