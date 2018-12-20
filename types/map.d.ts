import Observable from "./observable";
import { Property } from "./observable";
import { Event } from "./event";
/** @hidden */
export declare function map<V, V2>(src: Observable<V>, f: ((value: V) => V2) | Property<V2> | V2): Observable<V2>;
/** @hidden */
export declare function mapT<V, V2>(f: ((value: V) => V2) | V2): (e: Event<V>, sink: import("../../../../../Users/juha/code/bacon.js/src/types").Sink<Event<V2>>) => import("../../../../../Users/juha/code/bacon.js/src/reply").Reply;
export default map;
