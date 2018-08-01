import "./takeuntil";
import { SpawnerOrObservable } from "./flatmap_";
import Observable from "./observable";
/** @hidden */
export default function flatMapLatest<V, V2>(src: Observable<V>, f_: SpawnerOrObservable<V, V2>): Observable<V2>;
