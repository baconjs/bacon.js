import Observable from "./observable";
import { Event } from "./event";
import { Predicate, PredicateOrProperty } from "./predicate";
/** @hidden */
export declare function filter<V>(src: Observable<V>, f: PredicateOrProperty<V>): Observable<V>;
/** @hidden */
export declare function filterT<V>(f: Predicate<V>): (e: Event<V>, sink: import("../../../../../Users/juha/code/bacon.js/src/types").Sink<Event<V>>) => import("../../../../../Users/juha/code/bacon.js/src/reply").Reply;
