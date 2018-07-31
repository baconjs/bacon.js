import "./concat";
import Observable, { EventStream } from "./observable";
export declare type GroupKey = string;
export interface GroupLimiter<V> {
    (data: EventStream<V>, firstValue: V): EventStream<V>;
}
export declare function groupBy<V>(src: Observable<V>, keyF: (T: any) => GroupKey, limitF?: GroupLimiter<V>): Observable<Observable<V>>;
