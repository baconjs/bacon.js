import Property from "./property";
import { Desc } from "./describe";
import { endEvent, initialEvent } from "./event";
import Bacon from "./core";
import { nop } from "./helpers";
import { EventSink } from "./types";

export default function constant<V>(value: V) {
  return new Property<V>(new Desc(Bacon, "constant", [value]), function(sink : EventSink<V>) {
    sink(initialEvent(value));
    sink(endEvent());
    return nop;
  });
}

Bacon.constant = constant
