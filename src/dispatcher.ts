import _ from "./_";
import { more, noMore } from "./reply";
import { assertFunction, nop } from "./helpers";
import { Event, endEvent } from "./event";
import UpdateBarrier from "./updatebarrier";
import { EventSink, Subscribe, Unsub } from "./types"

interface Subscription<V> {
  sink: EventSink<V>
}

export default class Dispatcher<V, O> {
  _subscribe: Subscribe<V>
  _handleEvent?: EventSink<V>
  pushing: boolean = false
  ended: boolean = false
  prevError: any = undefined;
  unsubSrc?: Unsub = undefined;
  subscriptions: Subscription<V>[]
  queue: Event<V>[]
  observable: O

  constructor(observable: O, _subscribe: Subscribe<V>, _handleEvent?: EventSink<V>) {
    this._subscribe = _subscribe;
    this._handleEvent = _handleEvent;
    this.subscribe = _.bind(this.subscribe, this);
    this.handleEvent = _.bind(this.handleEvent, this);
    this.subscriptions = []
    this.observable = observable
    this.queue = []
  }
  hasSubscribers() {
    return this.subscriptions.length > 0;
  }
  removeSub(subscription: Subscription<V>): Subscription<V>[] {
    this.subscriptions = _.without(subscription, this.subscriptions);
    return this.subscriptions;
  }
  push(event: Event<V>) {
    if (event.isEnd) {
      this.ended = true;
    }
    return UpdateBarrier.inTransaction(event, this, this.pushIt, [event]);
  }
  pushToSubscriptions(event: Event<V>) {
    try {
      let tmp = this.subscriptions;
      const len = tmp.length;
      for (let i = 0; i < len; i++) {
        const sub = tmp[i];
        let reply = sub.sink(event);
        if (reply === noMore || event.isEnd) {
          this.removeSub(sub);
        }
      }
      return true;
    } catch (error) {
      this.pushing = false;
      this.queue = []; // ditch queue in case of exception to avoid unexpected behavior
      throw error;
    }
  }
  pushIt(event: Event<V>) {
    if (!this.pushing) {
      if (event === this.prevError) {
        return;
      }
      if (event.isError) {
        this.prevError = event;
      }
      this.pushing = true;
      this.pushToSubscriptions(event);
      this.pushing = false;
      while (true) {
        let e: Event<V> | undefined = this.queue.shift();
        if (e) {
          this.push(e);
        } else {
          break
        }
      }
      if (this.hasSubscribers()) {
        return more;
      } else {
        this.unsubscribeFromSource();
        return noMore;
      }
    } else {
      this.queue.push(event);
      return more;
    }
  }
  handleEvent(event: Event<V>) {
    if (this._handleEvent) {
      return this._handleEvent(event);
    } else {
      return this.push(event);
    }
  };

  unsubscribeFromSource() {
    if (this.unsubSrc) {
      this.unsubSrc();
    }
    this.unsubSrc = undefined;
  }

  subscribe(sink: EventSink<V>) {
    if (this.ended) {
      sink(endEvent());
      return nop;
    } else {
      assertFunction(sink);
      let subscription = {
        sink: sink
      };
      this.subscriptions.push(subscription);
      if (this.subscriptions.length === 1) {
        this.unsubSrc = this._subscribe(this.handleEvent);
        assertFunction(this.unsubSrc);
      }

      return () => {
        this.removeSub(subscription);
        if (!this.hasSubscribers()) {
          return this.unsubscribeFromSource();
        }
      }
    }
  }
  inspect() {
    return this.observable.toString()
  }
}
