import Observable from "./observable";
export interface Equals<A> {
    (left: A, right: A): boolean;
}
/** @hidden */
export declare function equals(a: any, b: any): boolean;
/** @hidden */
export default function skipDuplicates<A>(src: Observable<A>, isEqual?: Equals<A>): Observable<A>;
