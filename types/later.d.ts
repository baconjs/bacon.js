import "./scheduler";
import { EventStream } from "./observable";
/**

 Creates a single-element stream that emits given value after given delay and ends.

 @param delay delay in milliseconds
 @param value value to be emitted
 @typeparam V Type of stream elements

 */
export default function later<V>(delay: number, value: V): EventStream<V>;
