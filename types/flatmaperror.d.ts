import "./maperror";
import "./flatmap";
import Observable from "./observable";
import { EventOrValue } from "./flatmap_";
/** @hidden */
export default function flatMapError<V, V2>(src: Observable<V>, f: (error: any) => Observable<V2> | EventOrValue<V2>): Observable<V | V2>;
