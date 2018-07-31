import Observable from "./observable";
import { Property } from "./observable";
import { Event } from "./event";
export declare function map<V, V2>(src: Observable<V>, f: ((V: any) => V2) | Property<V2> | V2): Observable<V2>;
export declare function mapT<V, V2>(f: ((V: any) => V2) | V2): (e: Event<V>, sink: import("../../../../../Users/juha/code/bacon.js/src/types").Sink<Event<V2>>) => any;
export default map;
