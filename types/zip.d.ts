import "./sample";
import Observable, { EventStream } from "./observable";
export declare function zipAsArray<V>(...args: (Observable<V> | Observable<V>[])[]): Observable<V[]>;
export declare function zipWith(...args: any[]): EventStream<any>;
/** @hidden */
export declare function zip<V, V2, Out>(left: Observable<V>, right: Observable<V2>, f: (V: any, V2: any) => Out): EventStream<Out>;
