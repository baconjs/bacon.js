import './flatmap_';
import { SpawnerOrObservable } from "./flatmap_";
import Observable from "./observable";
/** @hidden */
export default function flatMapWithConcurrencyLimit<V, V2>(src: Observable<V>, limit: number, f: SpawnerOrObservable<V, V2>): Observable<V2>;
