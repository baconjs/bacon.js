import { EventStream } from "./observable";
import Observable from "./observable";
export declare function mergeAll<V>(...streams: (Observable<V> | Observable<V>[])[]): EventStream<V>;
