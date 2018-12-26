import { default as Observable } from "./observable";
import { Reply } from "./reply";
import { Event } from "./event";
import { EventSink } from "./types";
import { Predicate, PredicateOrProperty } from "./predicate";
/** @hidden */
export declare function skipWhile<V>(src: Observable<V>, f: PredicateOrProperty<V>): Observable<V>;
/** @hidden */
export declare function skipWhileT<V>(f: Predicate<V>): (event: Event<V>, sink: EventSink<V>) => Reply;
export default skipWhile;
