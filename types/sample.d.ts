import Observable, { EventStream, Property } from "./observable";
/** @hidden */
export declare function sampledByP<V, V2, R>(samplee: Property<V>, sampler: Observable<V2>, f: (V: any, V2: any) => R): Observable<R>;
/** @hidden */
export declare function sampledByE<V, V2, R>(samplee: EventStream<V>, sampler: Observable<V2>, f: (V: any, V2: any) => R): Observable<R>;
/** @hidden */
export declare function sampleP<V>(samplee: Property<V>, samplingInterval: number): EventStream<V>;
