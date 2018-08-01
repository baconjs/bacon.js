import { EventStream } from "./observable";
/**
 Creates an EventStream that immediately ends.
 @typeparam V Type of stream elements
 */
export default function never<V>(): EventStream<V>;
