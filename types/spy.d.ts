import Observable from "./observable";
export declare type Spy = (obs: Observable<any>) => any;
/** @hidden */
export declare function registerObs(obs: Observable<any>): void;
/**
 Adds your function as a "spy" that will get notified on all new Observables.
 This will allow a visualization/analytics tool to spy on all Bacon activity.
 */
export declare const spy: (spy: Spy) => number;
export default spy;
