import Observable from "./observable";
/** @hidden */
export default function endOnError<T>(src: Observable<T>, predicate?: (any: any) => boolean): Observable<T>;
