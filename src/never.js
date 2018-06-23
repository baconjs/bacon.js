import EventStream from "./eventstream";
import { endEvent } from "./event";
import { describe } from "./describe";
import { nop } from "./helpers";
import Bacon from "./core";

export default function never() {
  return new EventStream(describe(Bacon, "never"), (sink) => {
    sink(endEvent());
    return nop;
  });
}

Bacon.never = never
