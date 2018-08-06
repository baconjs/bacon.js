import _ from './_';

/** @hidden */
var eventIdCounter = 0;

/**
 * Base class for all events passed through [EventStreams](eventstream.html) and [Properties](property.html).
 */
export abstract class Event<V> {
  id: number = ++eventIdCounter
  /** @hidden */
  isEvent: boolean = true
  /** @hidden */
  _isEvent: boolean = true
  isEnd: boolean = false
  isInitial: boolean = false
  isNext: boolean = false
  isError: boolean = false
  hasValue: boolean = false
  /** @hidden */
  filter(f: (V) => boolean) : boolean { return true }
  /** @hidden */
  inspect(): string { return this.toString() }
  /** @hidden */
  log(): any { return this.toString() }
  /** @hidden */
  toNext(): Event<V> { return this }
  /** @hidden */
  abstract fmap<V2>(f: (V) => V2): Event<V2>
}

/**
 *  Base class for all [Events](event.html) carrying a value.
 *
 *  Can be distinguished from other events using [hasValue](../globals.html#hasvalue)
 **/
export abstract class Value<V> extends Event<V> {
  value: V;
  hasValue: boolean = true
  constructor(value: V) {
    super();
    if (value instanceof Event) {
      throw new Error("Wrapping an event inside other event")
    }
    this.value = value
  }
  /** @hidden */
  fmap<V2>(f: (V) => V2): Value<V2> {
    return this.apply(f(this.value))
  }
  /** @hidden */
  filter(f: (V)=>boolean): boolean { return f(this.value) }
  /** @hidden */
  toString(): string { return _.toString(this.value) }
  //toString(): string { return "<value " + this.id + ">" + _.toString(this.value) }
  /** @hidden */
  log(): any { return this.value; }
  /** @hidden */
  abstract apply<V2>(value: V2): Value<V2>;
}

/**
 *  Indicates a new value in an [EventStream](eventstream.html) or a [Property](property.html).
 *
 *  Can be distinguished from other events using [isNext](../globals.html#isnext)
 */
export class Next<V> extends Value<V> {
  constructor(value: V) {
    super(value)
  }
  /** @hidden */
  apply<V2>(value: V2): Next<V2> { return new Next<V2>(value) }
  isNext: boolean = true
  /** @hidden */
  _isNext: boolean = true // some compatibility stuff?
}

/**
 * An event carrying the initial value of a [Property](classes/property.html). This event can be emitted by a property
 * immediately when subscribing to it.
 *
 * Can be distinguished from other events using [isInitial](../globals.html#isinitial)
 */
export class Initial<V> extends Value<V> {
  constructor(value: V) {
    super(value)
  }
  /** @hidden */
  apply<V2>(value: V2): Initial<V2> { return new Initial<V2>(value) }
  isInitial: boolean = true
  /** @hidden */
  _isInitial: boolean = true
  /** @hidden */
  toNext(): Next<V> { return new Next(this.value) }
}

/**
 * Base class for events not carrying a value.
 */
abstract class NoValue<V> extends Event<V> {
  /** @hidden */
  fmap<V2>(f: (V) => V2): NoValue<V2> {
    return <NoValue<V2>><any>this
  }
  hasValue: boolean = false
}

/**
 * An event that indicates the end of an [EventStream](classes/eventstream.html) or a [Property](classes/property.html).
 * No more events can be emitted after this one.
 *
 * Can be distinguished from other events using [isEnd](../globals.html#isend)
 */
export class End<V> extends NoValue<V> {
  isEnd: boolean = true
  /** @hidden */
  toString(): string { return "<end>" }
}

/**
 *  An event carrying an error. You can use [onError](observable.html#onerror) to subscribe to errors.
 */
export class Error<V> extends NoValue<V> {
  /**
   * The actual error object carried by this event
   */
  error: any;
  constructor(error: any) {
    super()
    this.error = error
  }
  isError: boolean = true
  /** @hidden */
  toString() { 
    return "<error> " + _.toString(this.error)
  }
}

/** @hidden */
export function initialEvent<V>(value: V): Initial<V> { return new Initial(value); }
/** @hidden */
export function nextEvent<V>(value: V): Next<V> { return new Next(value); }
/** @hidden */
export function endEvent<V>(): End<V> { return new End(); }
/** @hidden */
export function toEvent<V>(x: V | Event<V>): Event<V> {
  if (x && (<any>x)._isEvent) {
    return <Event<V>>x;
  } else {
    return nextEvent(<V>x);
  }
}
export default Event

/**
 * Returns true if the given object is an [Event](classes/event.html).
 */
export function isEvent<V>(e): e is Event<V> {
  return e && e._isEvent
}

/**
 * Returns true if the given event is an [Initial](classes/initial.html) value of a [Property](classes/property.html).
 */
export function isInitial<V>(e): e is Initial<V> {
  return e && e._isInitial
}

/**
 * Returns true if the given event is an [Error](classes/error.html) event of an [Observable](classes/observable.html).
 */
export function isError<V>(e: Event<V>): e is Error<V> {
  return e.isError
}

/**
 * Returns true if the given event is a [Value](classes/value.html), i.e. a [Next](classes/next.html) or
 * an [Initial](classes/error.html) value of an [Observable](classes/observable.html).
 */
export function hasValue<V>(e: Event<V>): e is Value<V> {
  return e.hasValue
}

/**
 * Returns true if the given event is an [End](classes/end.html)
 */
export function isEnd<V>(e: Event<V>): e is End<V> {
  return e.isEnd
}

/**
 * Returns true if the given event is a [Next](classes/next.html)
 */
export function isNext<V>(e: Event<V>): e is Next<V> {
  return e.isNext
}