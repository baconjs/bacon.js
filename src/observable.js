// build-dependencies: updatebarrier
// build-dependencies: describe
// build-dependencies: functionconstruction
// build-dependencies: optional
// build-dependencies: reply
// build-dependencies: event

var idCounter = 0;
var registerObs = function() {};

function Observable(desc) {
  this.desc = desc;
  this.id = ++idCounter;
  this.initialDesc = this.desc;
}

extend(Observable.prototype, {
  _isObservable: true,

  subscribe(sink) {
    return UpdateBarrier.wrappedSubscribe(this, sink);
  },

  subscribeInternal(sink) {
    // For backward compatibility. To be removed in 0.8
    return this.dispatcher.subscribe(sink);
  },

  onValue() {
    var f = makeFunctionArgs(arguments);
    return this.subscribe(function(event) {
      if (event.hasValue()) { return f(event.value()); }
    });
  },

  onValues(f) {
    return this.onValue(function(args) { return f(...args); });
  },

  onError() {
    var f = makeFunctionArgs(arguments);
    return this.subscribe(function(event) {
      if (event.isError()) { return f(event.error); }
    });
  },

  onEnd() {
    var f = makeFunctionArgs(arguments);
    return this.subscribe(function(event) {
      if (event.isEnd()) { return f(); }
    });
  },

  name(name) {
    this._name = name;
    return this;
  },

  withDescription() {
    this.desc = describe(...arguments);
    return this;
  },

  toString() {
    if (this._name) {
      return this._name;
    } else {
      return this.desc.toString();
    }
  },

  deps() {
    return this.desc.deps()
  },

  internalDeps() {
    return this.initialDesc.deps();
  }
});

Observable.prototype.assign = Observable.prototype.onValue;
Observable.prototype.forEach = Observable.prototype.onValue;
Observable.prototype.inspect = Observable.prototype.toString;

Bacon.Observable = Observable;
