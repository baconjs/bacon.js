import { EventStream } from "./observable";
import { Event } from "./event";
/**
 Repeats given elements indefinitely
 with given interval in milliseconds. For example, `repeatedly(10, [1,2,3])`
 would lead to `1,2,3,1,2,3...` to be repeated indefinitely.

 @param delay between values, in milliseconds
 @param values array of values to repeat
 @typeparam V Type of stream elements

 */
export default function repeatedly<V>(delay: number, values: (V | Event<V>)[]): EventStream<V>;
