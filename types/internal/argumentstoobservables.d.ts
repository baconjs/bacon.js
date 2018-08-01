import Observable from "../observable";
/** @hidden */
export declare function argumentsToObservables<T>(args: (Observable<T> | Observable<T>[] | T)[]): Observable<T>[];
/** @hidden */
export declare function argumentsToObservablesAndFunction(args: any): [Observable<any>[], Function];
