import Observable from "./observable";
export declare class Desc {
    context: any;
    method?: string;
    args: any[];
    /** @hidden */
    cachedDeps?: Observable<any>[];
    /** @hidden */
    _isDesc: boolean;
    constructor(context: any, method: string, args?: any[]);
    deps(): Observable<any>[];
    toString(): string;
}
/** @hidden */
export declare function describe(context: any, method: string, ...args: any[]): Desc;
/** @hidden */
export declare function findDeps(x: any): Observable<any>[];
export default describe;
