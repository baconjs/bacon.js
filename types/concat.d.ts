import { EventStream, EventStreamOptions } from "./observable";
import Observable from "./observable";
/** @hidden */
export declare function concatE<V>(left: EventStream<V>, right: Observable<V>, options?: EventStreamOptions): EventStream<V>;
/** @hidden */
export declare function concatAll<V>(...streams_: (Observable<V> | Observable<V>[])[]): EventStream<V>;
