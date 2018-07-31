import Observable from "./observable";
export interface Spy {
    (obs: Observable<any>): any;
}
export declare function registerObs(obs: Observable<any>): void;
export declare const spy: (spy: Spy) => number;
export default spy;
