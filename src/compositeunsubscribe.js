function CompositeUnsubscribe(ss = []) {
  this.unsubscribe = this.unsubscribe.bind(this);
  this.unsubscribed = false;
  this.subscriptions = [];
  this.starting = [];
  for (var i = 0, s; i < ss.length; i++) {
    s = ss[i];
    this.add(s);
  }
}

_.extend(CompositeUnsubscribe.prototype, {
  add(subscription) {
    if (this.unsubscribed) { return; }
    var ended = false;
    var unsub = nop;
    this.starting.push(subscription);
    var unsubMe = () => {
      if (this.unsubscribed) { return; }
      ended = true;
      this.remove(unsub);
      return _.remove(subscription, this.starting);
    };
    unsub = subscription(this.unsubscribe, unsubMe);
    if (!(this.unsubscribed || ended)) {
      this.subscriptions.push(unsub);
    } else {
      unsub();
    }
    _.remove(subscription, this.starting);
    return unsub;
  },

  remove(unsub) {
    if (this.unsubscribed) { return; }
    if ((_.remove(unsub, this.subscriptions)) !== undefined) { return unsub(); }
  },

  unsubscribe() {
    if (this.unsubscribed) { return; }
    this.unsubscribed = true;
    var iterable = this.subscriptions;
    for (var i = 0; i < iterable.length; i++) {
      iterable[i]();
    }
    this.subscriptions = [];
    this.starting = [];
    return [];
  },

  count() {
    if (this.unsubscribed) { return 0; }
    return this.subscriptions.length + this.starting.length;
  },

  empty() {
    return this.count() === 0;
  }
});

Bacon.CompositeUnsubscribe = CompositeUnsubscribe;
