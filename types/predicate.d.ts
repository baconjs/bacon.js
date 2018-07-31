import { Property } from "./observable";
import { Desc } from "./describe";
import Observable from "./observable";
import { Transformer } from "./transform";
export declare type Predicate<V> = (V: any) => boolean;
export declare type PredicateOrBoolean<V> = Predicate<V> | boolean;
export declare type PredicateOrProperty<V> = Predicate<V> | boolean | Property<boolean>;
export declare function toPredicate<V>(f: PredicateOrBoolean<V>): Predicate<V>;
interface Predicate2Transformer<V> {
    (p: Predicate<V>): Transformer<V, V>;
}
export declare function withPredicate<V>(src: Observable<V>, f: PredicateOrProperty<V>, predicateTransformer: Predicate2Transformer<V>, desc: Desc): Observable<V>;
export {};
