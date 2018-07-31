import Observable from "./observable";
export default function endOnError<T>(src: Observable<T>, predicate?: (any: any) => boolean): Observable<T>;
