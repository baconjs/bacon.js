import Observable, { EventStream, Property } from "./observable";
declare type Combinator<V, V2, R> = (x: V, y: V2) => R;
/** @hidden */
export declare function sampledBy<V, V2, R>(samplee: Observable<V>, sampler: Observable<V2>, f: Combinator<V, V2, R>): Observable<R>;
/** @hidden */
export declare function sampledByP<V, V2, R>(samplee: Property<V>, sampler: Observable<V2>, f: Combinator<V, V2, R>): Observable<R>;
/** @hidden */
export declare function sampledByE<V, V2, R>(samplee: EventStream<V>, sampler: Observable<V2>, f: Combinator<V, V2, R>): Observable<R>;
/** @hidden */
export declare function sampleP<V>(samplee: Property<V>, samplingInterval: number): EventStream<V>;
export {};
