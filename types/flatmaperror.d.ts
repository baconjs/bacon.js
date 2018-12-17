import "./maperror";
import "./flatmap";
import Observable from "./observable";
/** @hidden */
export default function flatMapError<V>(src: Observable<V>, f: (error: any) => Observable<V>): Observable<V>;
