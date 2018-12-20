import { Unsub } from "./types";
declare type Subscription = (unsubAll: Unsub, unsubMe: Unsub) => Unsub;
/** @hidden */
export default class CompositeUnsubscribe {
    unsubscribed: boolean;
    subscriptions: Unsub[];
    starting: Subscription[];
    constructor(ss?: Subscription[]);
    add(subscription: Subscription): void;
    remove(unsub: Unsub): void;
    unsubscribe(): void;
    count(): number;
    empty(): boolean;
}
export {};
