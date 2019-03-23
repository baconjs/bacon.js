import { Desc } from "./describe";
import { Event } from "./event";
import Observable from "./observable";
export declare type ValueSpawner<V, V2> = (value: V) => (Observable<V2> | EventOrValue<V2>);
export declare type SpawnerOrObservable<V, V2> = ValueSpawner<V, V2> | Observable<V2>;
export declare type EventSpawner<V, V2> = (e: Event<V>) => Observable<V2> | EventOrValue<V2>;
export declare type EventOrValue<V> = Event<V> | V;
/** @hidden */
export interface FlatMapParams {
    desc?: Desc;
    mapError?: boolean;
    firstOnly?: boolean;
    limit?: number;
}
/** @hidden */
export declare function flatMap_<In, Out>(spawner: EventSpawner<In, Out>, src: Observable<In>, params?: FlatMapParams): Observable<Out>;
/** @hidden */
export declare function handleEventValueWith<In, Out>(f: SpawnerOrObservable<In, Out>): EventSpawner<In, Out>;
/** @hidden */
export declare function makeObservable<V>(x: V | Observable<V> | Event<V>): Observable<V>;
export default flatMap_;
