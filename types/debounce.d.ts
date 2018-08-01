import "./flatmaplatest";
import "./filter";
import "./concat";
import Observable from "./observable";
/** @hidden */
export declare function debounce<V>(src: Observable<V>, delay: number): Observable<V>;
/** @hidden */
export declare function debounceImmediate<V>(src: Observable<V>, delay: number): Observable<V>;
export default debounce;
