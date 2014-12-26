import without from "../helpers/without";
import assertFunction from "../helpers/assertFunction";
import end from "../helpers/end";
import nop from "../helpers/nop";
import UpdateBarrier from "../globals/UpdateBarrier";

export default class Dispatcher {
  constructor(_subscribe, _handleEvent) {
    this._subscribe = _subscribe;
    this._handleEvent = _handleEvent;
    this.subscribe = _subscribe.call(this);
    this.handleEvent = _handleEvent.call(this);
    this.subscriptions = [];
    this.queue = [];
    this.pushing = false;
    this.ended = false;
  }
  hasSubscribers() {
    return this.subscriptions.length > 0;
  }
  removeSub(subscription) {
    this.subscriptions = without(subscription, this.subscriptions);
  }
  push(event) {
    if (event.isEnd()) {
      this.ended = true;
    }
    return UpdateBarrier.inTransaction(event, this, this.pushIt, [event]);
  }
  pushToSubscriptions(event) {
    var e, reply, sub, tmp, _i, _len;
    try {
      tmp = this.subscriptions;
      for (_i = 0, _len = tmp.length; _i < _len; _i++) {
        sub = tmp[_i];
        reply = sub.sink(event);
        if (reply === Bacon.noMore || event.isEnd()) {
          this.removeSub(sub);
        }
      }
      return true;
    } catch (_error) {
      e = _error;
      this.pushing = false;
      this.queue = [];
      throw e;
    }
  }
  pushIt(event) {
    if (!this.pushing) {
      if (event === this.prevError) {
        return;
      }
      if (event.isError()) {
        this.prevError = event;
      }
      this.pushing = true;
      this.pushToSubscriptions(event);
      this.pushing = false;
      while (this.queue.length) {
        event = this.queue.shift();
        this.push(event);
      }
      if (this.hasSubscribers()) {
        return Bacon.more;
      } else {
        this.unsubscribeFromSource();
        return Bacon.noMore;
      }
    } else {
      this.queue.push(event);
      return Bacon.more;
    }
  }
  handleEvent(event) {
    if (this._handleEvent) {
      return this._handleEvent(event);
    } else {
      return this.push(event);
    }
  }
  unsubscribeFromSource() {
    if (this.unsubSrc) {
      this.unsubSrc();
    }
    this.unsubSrc = undefined;
  }
  subscribe(sink) {
    var subscription;
    if (this.ended) {
      sink(end());
      return nop;
    } else {
      assertFunction(sink);
      subscription = {
        sink: sink
      };
      this.subscriptions.push(subscription);
      if (this.subscriptions.length === 1) {
        this.unsubSrc = this._subscribe(this.handleEvent);
        assertFunction(this.unsubSrc);
      }
      return (function(_this) {
        return function() {
          _this.removeSub(subscription);
          if (!_this.hasSubscribers()) {
            return _this.unsubscribeFromSource();
          }
        };
      })(this);
    }
  }
}