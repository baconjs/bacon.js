import Observable from "./observable";
import { EventSpawner } from "./flatmap_";
/** @hidden */
export default function flatMapEvent<V, V2>(src: Observable<V>, f: EventSpawner<V, V2>): Observable<V2>;
