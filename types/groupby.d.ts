import "./concat";
import Observable, { EventStream } from "./observable";
export interface GroupLimiter<V> {
    (data: EventStream<V>, firstValue: V): EventStream<V>;
}
/** @hidden */
export declare function groupBy<V>(src: Observable<V>, keyF: (value: V) => string, limitF?: GroupLimiter<V>): Observable<EventStream<V>>;
