import Property from "./property";
import { Desc } from "./describe";
import { initialEvent, endEvent } from "./event";
import Bacon from "./core";
import { nop } from "./helpers";

export default function constant(value) {
  return new Property(new Desc(Bacon, "constant", [value]), function(sink) {
    sink(initialEvent(value));
    sink(endEvent());
    return nop;
  });
}
