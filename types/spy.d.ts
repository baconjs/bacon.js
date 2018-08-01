import Observable from "./observable";
export interface Spy {
    (obs: Observable<any>): any;
}
/** @hidden */
export declare function registerObs(obs: Observable<any>): void;
/** @hidden */
export declare const spy: (spy: Spy) => number;
export default spy;
