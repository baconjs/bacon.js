import { inherit, extend } from './helpers';
import _ from './_';

function Source(obs, sync) {
  this.obs = obs;
  this.sync = sync;
  this.queue = [];
}

extend(Source.prototype, {
  _isSource: true,

  subscribe(sink) { return this.obs.dispatcher.subscribe(sink); },
  toString() { return this.obs.toString(); },
  markEnded() {
    this.ended = true;
    return true;
  },
  consume() {
    return this.queue[0];
  },
  push(x) {
    this.queue = [x];
  },
  mayHave() { return true; },
  hasAtLeast() { return this.queue.length; },
  flatten: true
});

function ConsumingSource() {
  Source.apply(this, arguments);
}

inherit(ConsumingSource, Source);
extend(ConsumingSource.prototype, {
  consume() { return this.queue.shift(); },
  push(x) { return this.queue.push(x); },
  mayHave(c) { return !this.ended || this.queue.length >= c; },
  hasAtLeast(c) { return this.queue.length >= c; },
  flatten: false
});

function BufferingSource(obs) {
  Source.call(this, obs, true);
}

inherit(BufferingSource, Source);
extend(BufferingSource.prototype, {
  consume() {
    const values = this.queue;
    this.queue = [];
    return {
      value: values
    };
  },
  push(x) { return this.queue.push(x.value); },
  hasAtLeast() { return true; }
});


Source.isTrigger = function(s) {
  if (s == null) return false
  if (s._isSource) {
    return s.sync;
  } else {
    return s._isEventStream
  }
};

Source.fromObservable = function(s) {
  if (s != null && s._isSource) {
    return s;
  } else if (s != null && s._isProperty) {
    return new Source(s, false);
  } else {
    return new ConsumingSource(s, true);
  }
};

export { Source, ConsumingSource, BufferingSource };
