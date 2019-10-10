import { Reply } from "../reply";
import { nop } from "../helpers";
import { Event } from "../event";
import { EventSink, Subscribe, Unsub } from "../types";
interface Subscription<V> {
    sink: EventSink<V>;
}
/** @hidden */
export default class Dispatcher<V, O> {
    _subscribe: Subscribe<V>;
    _handleEvent?: EventSink<V>;
    pushing: boolean;
    ended: boolean;
    prevError: any;
    unsubSrc?: Unsub;
    subscriptions: Subscription<V>[];
    queue: Event<V>[];
    observable: O;
    constructor(observable: O, _subscribe: Subscribe<V>, _handleEvent?: EventSink<V>);
    hasSubscribers(): boolean;
    removeSub(subscription: Subscription<V>): Subscription<V>[];
    push(event: Event<V>): any;
    pushToSubscriptions(event: Event<V>): boolean;
    pushIt(event: Event<V>): Reply | undefined;
    handleEvent(event: Event<V>): any;
    unsubscribeFromSource(): void;
    subscribe(sink: EventSink<V>): typeof nop;
    inspect(): any;
}
export {};
