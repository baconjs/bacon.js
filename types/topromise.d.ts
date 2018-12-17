import Observable from "./observable";
import "./last";
/** @hidden */
export declare function firstToPromise<V>(src: Observable<V>, PromiseCtr: Function | undefined): Promise<V>;
/** @hidden */
export declare function toPromise<V>(src: Observable<V>, PromiseCtr: Function | undefined): Promise<V>;
