import { inherit, extend } from './helpers';
import _ from './_';

function Source(obs, sync, lazy = false) {
  this.obs = obs;
  this.sync = sync;
  this.lazy = lazy;
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
    if (this.lazy) {
      return { value: _.always(this.queue[0]) };
    } else {
      return this.queue[0];
    }
  },
  push(x) {
    this.queue = [x];
    return [x];
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
      value: function() {
        return values;
      }
    };
  },
  push(x) { return this.queue.push(x.value()); },
  hasAtLeast() { return true; }
});


Source.isTrigger = function(s) {
  if (s != null ? s._isSource : void 0) {
    return s.sync;
  } else {
    return s != null ? s._isEventStream : void 0;
  }
};

Source.fromObservable = function(s) {
  if (s != null ? s._isSource : void 0) {
    return s;
  } else if (s != null ? s._isProperty : void 0) {
    return new Source(s, false);
  } else {
    return new ConsumingSource(s, true);
  }
};

export { Source, ConsumingSource, BufferingSource };
