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
export declare function describe(context: any, method: any, ...args: any[]): Desc;
export declare function findDeps(x: any): Observable[];
export default describe;
