import { EventStream, EventStreamOptions } from "./observable";
import Observable from "./observable";
export default function groupSimultaneous<V>(...streams: (Observable<V> | Observable<V>[])[]): EventStream<V[][]>;
export declare function groupSimultaneous_<V>(streams: Observable<V>[], options?: EventStreamOptions): EventStream<V[][]>;
