import "./maperror";
import "./flatmap";
import Observable from "./observable";
export default function flatMapError<V>(src: Observable<V>, f: (any: any) => Observable<V>): Observable<V>;
