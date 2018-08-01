interface Observable {
}
export declare class Desc {
    context: any;
    method?: string;
    args?: any[];
    cached?: Observable[];
    constructor(context: any, method: string, args?: any[]);
    _isDesc: boolean;
    deps(): Observable[];
    toString(): string;
}
/** @hidden */
export declare function describe(context: any, method: any, ...args: any[]): Desc;
/** @hidden */
export declare function findDeps(x: any): Observable[];
export default describe;
