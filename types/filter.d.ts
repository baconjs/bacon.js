import { Reply } from "./reply";
import Observable from "./observable";
import { Event } from "./event";
import { EventSink } from "./types";
import { Predicate, PredicateOrProperty } from "./predicate";
/** @hidden */
export declare function filter<V>(src: Observable<V>, f: PredicateOrProperty<V>): Observable<V>;
/** @hidden */
export declare function filterT<V>(f: Predicate<V>): (e: Event<V>, sink: EventSink<V>) => Reply;
