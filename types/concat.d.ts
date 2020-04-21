import { EventStream, EventStreamOptions } from "./observable";
import Observable from "./observable";
/** @hidden */
export declare function concatE<V, V2>(left: EventStream<V>, right: Observable<V2>, options?: EventStreamOptions): EventStream<V | V2>;
/**
 Concatenates given array of EventStreams or Properties. Works by subscribing to the first source, and listeing to that
 until it ends. Then repeatedly subscribes to the next source, until all sources have ended.

 See [`concat`](#observable-concat)
 */
export declare function concatAll<V>(...streams_: (Observable<V> | Observable<V>[])[]): EventStream<V>;
