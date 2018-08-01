import { EventStream } from "./observable";
import later from "./later";
import { Desc } from "./describe";

/**
 Creates a stream that ends after given amount of milliseconds, without emitting any values.

 @param duration duration of silence in milliseconds
 @typeparam V Type of stream elements
 */
export default function silence<V>(duration: number): EventStream<V> {
  return <any>later(duration, "")
    .filter(false)
    .withDesc(new Desc("Bacon", "silence", [duration]));
}