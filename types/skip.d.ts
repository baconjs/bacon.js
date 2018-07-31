import Observable from "./observable";
export default function skip<T>(src: Observable<T>, count: number): Observable<T>;
