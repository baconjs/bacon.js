import "./buffer";
import "./map";
import Observable from "./observable";
export default function throttle<V>(src: Observable<V>, delay: number): Observable<V>;
