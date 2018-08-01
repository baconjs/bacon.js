import { Event } from "./event";
import { EventStream } from "./observable";
/**
 Creates a stream containing given
 values (given as array). Delivered with given interval in milliseconds.

 @param delay between elements, in milliseconds
 @param array of values or events
 @typeparam V Type of stream elements

 */
export default function sequentially<V>(delay: number, values: (V | Event<V>)[]): EventStream<V>;
