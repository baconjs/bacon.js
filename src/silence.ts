import { EventStream } from "./observable";
import later from "./later";
import { Desc } from "./describe";

export default function silence<V>(duration: number): EventStream<V> {
  return <any>later(duration, "")
    .filter(false)
    .withDesc(new Desc("Bacon", "silence", [duration]));
}