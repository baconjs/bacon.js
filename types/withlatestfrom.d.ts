import { EventStream } from "./observable";
import Observable from "./observable";
import { Property } from "./observable";
/** @hidden */
export declare function withLatestFromE<V, V2, R>(sampler: EventStream<V>, samplee: Observable<V2>, f: (V: any, V2: any) => R): EventStream<R>;
/** @hidden */
export declare function withLatestFromP<V, V2, R>(sampler: Property<V>, samplee: Observable<V2>, f: (V: any, V2: any) => R): Property<R>;
/** @hidden */
export declare function withLatestFrom<V, V2, R>(sampler: Observable<V>, samplee: Observable<V2>, f: (V: any, V2: any) => R): Observable<R>;
export default withLatestFrom;
