import Observable from "./observable";
import { Event } from "./event";
export interface EventSpawner<V, V2> {
    (e: Event<V>): Observable<V2>;
}
export default function flatMapEvent<V, V2>(src: Observable<V>, f: EventSpawner<V, V2>): Observable<V2>;
