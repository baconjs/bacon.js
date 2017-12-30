// build-dependencies: _

var eventIdCounter = 0;

function Event() {
  this.id = ++eventIdCounter;
}

Event.prototype._isEvent = true;
Event.prototype.isEvent = function() { return true; };
Event.prototype.isEnd = function() { return false; };
Event.prototype.isInitial = function() { return false; };
Event.prototype.isNext = function() { return false; };
Event.prototype.isError = function() { return false; };
Event.prototype.hasValue = function() { return false; };
Event.prototype.filter = function() { return true; };
Event.prototype.inspect = function() { return this.toString(); };
Event.prototype.log = function() { return this.toString(); };
Event.prototype.toNext = function() { return this };

function Next(value) {
  if (!(this instanceof Next)) {
    return new Next(value);
  }
  Event.call(this);
  this.value = value
}

inherit(Next, Event);

Next.prototype.isNext = function() { return true; };
Next.prototype.hasValue = function() { return true; };

Next.prototype.fmap = function(f) {
  return this.apply(f(this.value))
};

Next.prototype.apply = function(value) { return new Next(value); };
Next.prototype.filter = function(f) { return f(this.value); };
Next.prototype.toString = function() { return _.toString(this.value); };
Next.prototype.log = function() { return this.value; };
Next.prototype._isNext = true;


function Initial(value) {
  if (!(this instanceof Initial)) {
    return new Initial(value);
  }
  Next.call(this, value);
}

inherit(Initial, Next);

Initial.prototype._isInitial = true;
Initial.prototype.isInitial = function() { return true; };
Initial.prototype.isNext = function() { return false; };
Initial.prototype.apply = function(value) { return new Initial(value); };
Initial.prototype.toNext = function() { return new Next(this.value); };

function End() {
  if (!(this instanceof End)) {
    return new End();
  }
  Event.call(this);
}

inherit(End, Event);
End.prototype.isEnd = function() { return true; };
End.prototype.fmap = function() { return this; };
End.prototype.apply = function() { return this; };
End.prototype.toString = function() { return "<end>"; };


function Error(error) {
  if (!(this instanceof Error)) {
    return new Error(error);
  }
  this.error = error;
  Event.call(this);
}

inherit(Error, Event);
Error.prototype.isError = function() { return true; };
Error.prototype.fmap = function() { return this; };
Error.prototype.apply = function() { return this; };
Error.prototype.toString = function() { return "<error> " + _.toString(this.error); };


Bacon.Event = Event;
Bacon.Initial = Initial;
Bacon.Next = Next;
Bacon.End = End;
Bacon.Error = Error;

var initialEvent = function(value) { return new Initial(value); };
var nextEvent = function(value) { return new Next(value); };
var endEvent = function() { return new End(); };
var toEvent = function(x) {
  if (x && x._isEvent) {
    return x;
  } else {
    return nextEvent(x);
  }
};
