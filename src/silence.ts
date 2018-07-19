import { EventStream } from "./observable";
import later from "./later";
import Bacon from "./core"

export default function silence<V>(duration: number): EventStream<V> {
  return <any>later(duration, "").filter(false);
}

Bacon.silence = silence