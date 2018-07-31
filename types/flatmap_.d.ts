import { Desc } from "./describe";
import { Event, EventOrValue } from "./event";
import Observable from "./observable";
export declare type SpawnerOrObservable<V, V2> = ((V: any) => (Observable<V2> | EventOrValue<V2>)) | Observable<V2>;
export declare type Spawner<V, V2> = (V: any) => (Observable<V2> | EventOrValue<V2>);
export interface FlatMapParams {
    desc?: Desc;
    mapError?: boolean;
    firstOnly?: boolean;
    limit?: number;
}
export declare function flatMap_<In, Out>(f_: SpawnerOrObservable<In, Out>, src: Observable<In>, params?: FlatMapParams): Observable<Out>;
export declare function handleEventValueWith<In, Out>(f: SpawnerOrObservable<In, Out>): ((In: any) => Observable<Out>);
export declare function makeObservable<V>(x: V | Observable<V> | Event<V>): Observable<V>;
export default flatMap_;
