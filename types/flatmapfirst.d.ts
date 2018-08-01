import { SpawnerOrObservable } from "./flatmap_";
import Observable from "./observable";
/** @hidden */
export default function flatMapFirst<V, V2>(src: Observable<V>, f: SpawnerOrObservable<V, V2>): Observable<V2>;
