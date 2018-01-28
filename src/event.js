import { inherit } from './helpers';
import _ from './_';

var eventIdCounter = 0;

export function Event() {
  this.id = ++eventIdCounter;
}

Event.prototype._isEvent = true;
Event.prototype.isEvent = true
Event.prototype.isEnd = false
Event.prototype.isInitial = false
Event.prototype.isNext = false
Event.prototype.isError = false
Event.prototype.hasValue = false
Event.prototype.filter = function() { return true; };
Event.prototype.inspect = function() { return this.toString(); };
Event.prototype.log = function() { return this.toString(); };
Event.prototype.toNext = function() { return this };

export function Next(value) {
  if (!(this instanceof Next)) {
    return new Next(value);
  }
  Event.call(this);
  this.value = value
}

inherit(Next, Event);

Next.prototype.isNext = true
Next.prototype.hasValue = true

Next.prototype.fmap = function(f) {
  return this.apply(f(this.value))
};

Next.prototype.apply = function(value) { return new Next(value); };
Next.prototype.filter = function(f) { return f(this.value); };
Next.prototype.toString = function() { return _.toString(this.value); };
Next.prototype.log = function() { return this.value; };
Next.prototype._isNext = true;

export function Initial(value) {
  if (!(this instanceof Initial)) {
    return new Initial(value);
  }
  Next.call(this, value);
}

inherit(Initial, Next);

Initial.prototype._isInitial = true;
Initial.prototype.isInitial = true
Initial.prototype.isNext = false
Initial.prototype.apply = function(value) { return new Initial(value); };
Initial.prototype.toNext = function() { return new Next(this.value); };

export function End() {
  if (!(this instanceof End)) {
    return new End();
  }
  Event.call(this);
}

inherit(End, Event);
End.prototype.isEnd = true
End.prototype.fmap = function() { return this; };
End.prototype.apply = function() { return this; };
End.prototype.toString = function() { return "<end>"; };


export function Error(error) {
  if (!(this instanceof Error)) {
    return new Error(error);
  }
  this.error = error;
  Event.call(this);
}

inherit(Error, Event);
Error.prototype.isError = true
Error.prototype.fmap = function() { return this; };
Error.prototype.apply = function() { return this; };
Error.prototype.toString = function() { return "<error> " + _.toString(this.error); };

export function initialEvent(value) { return new Initial(value); }
export function nextEvent(value) { return new Next(value); }
export function endEvent() { return new End(); }
export function toEvent(x) {
  if (x && x._isEvent) {
    return x;
  } else {
    return nextEvent(x);
  }
}
