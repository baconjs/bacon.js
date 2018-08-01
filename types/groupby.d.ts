import "./concat";
import Observable, { EventStream } from "./observable";
export interface GroupLimiter<V> {
    (data: EventStream<V>, firstValue: V): EventStream<V>;
}
/** @hidden */
export declare function groupBy<V>(src: Observable<V>, keyF: (T: any) => string, limitF?: GroupLimiter<V>): Observable<Observable<V>>;
