import { nop } from "./helpers";
import _ from "./_";
import { Unsub } from "./types";

interface Subscription {
  (unsubAll: Unsub, unsubMe: Unsub): Unsub
}

// TODO: types here are most likely messed up.

/** @hidden */
export default class CompositeUnsubscribe {
  unsubscribed: boolean = false
  subscriptions: Unsub[]
  starting: Subscription[]

  constructor(ss: Unsub[] = []) {
    this.unsubscribe = _.bind(this.unsubscribe, this);
    this.unsubscribed = false;
    this.subscriptions = [];
    this.starting = [];
    for (var i = 0, s; i < ss.length; i++) {
      s = ss[i];
      this.add(s);
    }
  }

  add(subscription: Subscription): void {
    if (!this.unsubscribed) {
      var ended = false
      var unsub: Unsub = nop
      this.starting.push(subscription);
      var unsubMe = () => {
        if (this.unsubscribed) { return; }
        ended = true;
        this.remove(unsub);
        _.remove(subscription, this.starting);
      }
      unsub = subscription(this.unsubscribe, unsubMe);
      if (!(this.unsubscribed || ended)) {
        this.subscriptions.push(unsub);
      } else {
        unsub();
      }
      _.remove(subscription, this.starting)
    }
  }

  remove(unsub: Unsub): void {
    if (this.unsubscribed) { return; }
    if ((_.remove(unsub, this.subscriptions)) !== undefined) { return unsub(); }
  }

  unsubscribe(): void {
    if (this.unsubscribed) { return; }
    this.unsubscribed = true;
    var iterable = this.subscriptions;
    for (var i = 0; i < iterable.length; i++) {
      iterable[i]();
    }
    this.subscriptions = [];
    this.starting = []
  }

  count(): number {
    if (this.unsubscribed) { return 0; }
    return this.subscriptions.length + this.starting.length;
  }

  empty(): boolean {
    return this.count() === 0;
  }
}
