import Observable from "./observable";
export declare function nop(): void;
export declare const isArray: ((any: any) => boolean);
export declare function isObservable<T>(x: any): x is Observable<T>;
