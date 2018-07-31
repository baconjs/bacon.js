import { Event } from "./event";
import { Desc } from "./describe";
import Observable from "./observable";
export declare function take<V>(count: number, src: Observable<V>, desc?: Desc): Observable<V>;
export declare function takeT<V>(count: number): (e: Event<V>, sink: import("../../../../../Users/juha/code/bacon.js/src/types").Sink<Event<V>>) => any;
