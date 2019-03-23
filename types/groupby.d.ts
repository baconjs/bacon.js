import "./concat";
import Observable, { EventStream } from "./observable";
export declare type GroupLimiter<V> = (data: EventStream<V>, firstValue: V) => Observable<V>;
/** @hidden */
export declare function groupBy<V>(src: Observable<V>, keyF: (value: V) => string, limitF?: GroupLimiter<V>): Observable<EventStream<V>>;
