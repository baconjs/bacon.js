import Observable from "./observable";
export declare function argumentsToObservables<T>(args: (Observable<T> | Observable<T>[] | T)[]): Observable<T>[];
export declare function argumentsToObservablesAndFunction(args: any): [Observable<any>[], Function];
