import Observable from "./observable";
import "./sample";
import "./filter";
import { PredicateOrProperty } from "./predicate";
/** @hidden */
export declare function takeWhile<V>(src: Observable<V>, f: PredicateOrProperty<V>): Observable<V>;
