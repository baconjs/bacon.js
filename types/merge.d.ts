import { EventStream } from "./observable";
import Observable from "./observable";
/**
 Merges given array of EventStreams or Properties, by collecting the values from all of the sources into a single
 EventStream.

 See also [`merge`](classes/eventstream.html#merge).
 */
export declare function mergeAll<V>(...streams: (Observable<V> | Observable<V>[])[]): EventStream<V>;
