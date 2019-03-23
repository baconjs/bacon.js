import "./concat";
import Observable, { EventStream } from "./observable";
export declare type GroupTransformer<V, V2> = (data: EventStream<V>, firstValue: V) => Observable<V2>;
/** @hidden */
export declare function groupBy<V, V2>(src: Observable<V>, keyF: (value: V) => string, limitF?: GroupTransformer<V, V2>): Observable<EventStream<V2>>;
