import { default as Observable } from "./observable";
import { Event } from "./event";
import { Predicate, PredicateOrProperty } from "./predicate";
export declare function skipWhile<V>(src: Observable<V>, f: PredicateOrProperty<V>): Observable<V>;
export declare function skipWhileT<V>(f: Predicate<V>): (event: Event<V>, sink: import("../../../../../Users/juha/code/bacon.js/src/types").Sink<Event<V>>) => any;
export default skipWhile;
