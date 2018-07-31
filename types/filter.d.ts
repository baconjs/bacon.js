import Observable from "./observable";
import { Event } from "./event";
import { Predicate, PredicateOrProperty } from "./predicate";
export declare function filter<V>(src: Observable<V>, f: PredicateOrProperty<V>): Observable<V>;
export declare function filterT<V>(f: Predicate<V>): (e: Event<V>, sink: import("../../../../../Users/juha/code/bacon.js/src/types").Sink<Event<V>>) => any;
