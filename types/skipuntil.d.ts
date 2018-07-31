import Observable from "./observable";
export declare function skipUntil<V>(src: Observable<V>, starter: Observable<any>): Observable<V>;
export default skipUntil;
