import _ from "./_";
import { more, noMore } from "./reply";
import { assertFunction, nop } from "./helpers";
import { endEvent } from "./event";
import UpdateBarrier from "./updatebarrier";

export default function Dispatcher(_subscribe, _handleEvent) {
  this._subscribe = _subscribe;
  this._handleEvent = _handleEvent;
  this.subscribe = _.bind(this.subscribe, this);
  this.handleEvent = _.bind(this.handleEvent, this);
  this.pushing = false;
  this.ended = false;
  this.prevError = undefined;
  this.unsubSrc = undefined;
  this.subscriptions = [];
  this.queue = [];
}

Dispatcher.prototype.hasSubscribers = function() {
  return this.subscriptions.length > 0;
};

Dispatcher.prototype.removeSub = function(subscription) {
  this.subscriptions = _.without(subscription, this.subscriptions);
  return this.subscriptions;
};

Dispatcher.prototype.push = function(event) {
  if (event.isEnd) {
    this.ended = true;
  }
  return UpdateBarrier.inTransaction(event, this, this.pushIt, [event]);
};

Dispatcher.prototype.pushToSubscriptions = function(event) {
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
};

Dispatcher.prototype.pushIt = function(event) {
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
    while (this.queue.length) {
      event = this.queue.shift();
      this.push(event);
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
};

Dispatcher.prototype.handleEvent = function(event) {
  if (this._handleEvent) {
    return this._handleEvent(event);
  } else {
    return this.push(event);
  }
};

Dispatcher.prototype.unsubscribeFromSource = function() {
  if (this.unsubSrc) {
    this.unsubSrc();
  }
  this.unsubSrc = undefined;
};

Dispatcher.prototype.subscribe = function(sink) {
  var subscription;
  if (this.ended) {
    sink(endEvent());
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
};
