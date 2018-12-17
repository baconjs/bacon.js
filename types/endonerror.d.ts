import Observable from "./observable";
/** @hidden */
export default function endOnError<T>(src: Observable<T>, predicate?: (error: any) => boolean): Observable<T>;
