import Observable from "./observable";
import "./mapend";
import "./skiperrors";
export default function takeUntil<V>(src: Observable<V>, stopper: Observable<any>): Observable<V>;
