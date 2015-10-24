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

function Next(valueF, eager) {
  if (!(this instanceof Next)) {
    return new Next(valueF, eager);
  }

  Event.call(this);

  if (!eager && _.isFunction(valueF) || (valueF != null ? valueF._isNext : void 0)) {
    this.valueF = valueF;
    this.valueInternal = void 0;
  } else {
    this.valueF = void 0;
    this.valueInternal = valueF;
  }
}

inherit(Next, Event);

Next.prototype.isNext = function() { return true; };
Next.prototype.hasValue = function() { return true; };
Next.prototype.value = function() {
  var ref;
  if ((ref = this.valueF) != null ? ref._isNext : void 0) {
    this.valueInternal = this.valueF.value();
    this.valueF = void 0;
  } else if (this.valueF) {
    this.valueInternal = this.valueF();
    this.valueF = void 0;
  }
  return this.valueInternal;
};

Next.prototype.fmap = function(f) {
  var event, value;
  if (this.valueInternal) {
    value = this.valueInternal;
    return this.apply(function() {
      return f(value);
    });
  } else {
    event = this;
    return this.apply(function() {
      return f(event.value());
    });
  }
};

Next.prototype.apply = function(value) { return new Next(value); };
Next.prototype.filter = function(f) { return f(this.value()); };
Next.prototype.toString = function() { return _.toString(this.value()); };
Next.prototype.log = function() { return this.value(); };
Next.prototype._isNext = true;


function Initial(valueF, eager) {
  if (!(this instanceof Initial)) {
    return new Initial(valueF, eager);
  }
  Next.call(this, valueF, eager);
}

inherit(Initial, Next);
Initial.prototype._isInitial = true;
Initial.prototype.isInitial = function() { return true; };
Initial.prototype.isNext = function() { return false; };
Initial.prototype.apply = function(value) { return new Initial(value); };
Initial.prototype.toNext = function() { return new Next(this); };

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

var initialEvent = function(value) { return new Initial(value, true); };
var nextEvent = function(value) { return new Next(value, true); };
var endEvent = function() { return new End(); };
var toEvent = function(x) {
  if (x && x._isEvent) {
    return x;
  } else {
    return nextEvent(x);
  }
};
