import Observable from "./observable";
import "./last";
export declare function firstToPromise<V>(src: Observable<V>, PromiseCtr: any): Promise<V>;
export declare function toPromise<V>(src: Observable<V>, PromiseCtr: any): Promise<V>;
