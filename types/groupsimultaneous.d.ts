import { EventStream, EventStreamOptions } from "./observable";
import Observable from "./observable";
/** @hidden */
export default function groupSimultaneous<V>(...streams: (Observable<V> | Observable<V>[])[]): EventStream<V[][]>;
/** @hidden */
export declare function groupSimultaneous_<V>(streams: Observable<V>[], options?: EventStreamOptions): EventStream<V[][]>;
