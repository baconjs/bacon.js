import Observable from "./observable";
export default function delay<V>(src: Observable<V>, delay: number): Observable<V>;
