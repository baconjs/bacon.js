import { Unsub } from "./types";
interface Subscription {
    (unsubAll: Unsub, unsubMe: Unsub): Unsub;
}
/** @hidden */
export default class CompositeUnsubscribe {
    unsubscribed: boolean;
    subscriptions: Unsub[];
    starting: Subscription[];
    constructor(ss?: Unsub[]);
    add(subscription: Subscription): void;
    remove(unsub: Unsub): void;
    unsubscribe(): void;
    count(): number;
    empty(): boolean;
}
export {};
