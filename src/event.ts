import _ from './_';

var eventIdCounter = 0;

export abstract class Event<V> {
  id: number = ++eventIdCounter
  isEvent: boolean = true
  _isEvent: boolean = true
  isEnd: boolean = false
  isInitial: boolean = false
  isNext: boolean = false
  isError: boolean = false
  hasValue: boolean = false
  filter(f: (V) => boolean) : boolean { return true }
  inspect(): string { return this.toString() }
  log(): any { return this.toString() }
  toNext(): Event<V> { return this }
  abstract fmap<V2>(f: (V) => V2): Event<V2>
}

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
  fmap<V2>(f: (V) => V2): Value<V2> {
    return this.apply(f(this.value))
  }
  filter(f: (V)=>boolean): boolean { return f(this.value) }
  toString(): string { return _.toString(this.value) }
  //toString(): string { return "<value " + this.id + ">" + _.toString(this.value) }
  log(): any { return this.value; }
  abstract apply<V2>(value: V2): Value<V2>;
}

export class Next<V> extends Value<V> {
  constructor(value: V) {
    super(value)
  }
  apply<V2>(value: V2): Next<V2> { return new Next<V2>(value) }
  isNext: boolean = true
  _isNext: boolean = true // some compatibility stuff?
}

export class Initial<V> extends Value<V> {
  constructor(value: V) {
    super(value)
  }
  apply<V2>(value: V2): Initial<V2> { return new Initial<V2>(value) }
  isInitial: boolean = true
  _isInitial: boolean = true
  toNext(): Next<V> { return new Next(this.value) }
}

abstract class NoValue<V> extends Event<V> {
  fmap<V2>(f: (V) => V2): NoValue<V2> {
    return <NoValue<V2>><any>this
  }
  hasValue: boolean = false
}

export class End<V> extends NoValue<V> {
  isEnd: boolean = true
  toString(): string { return "<end>" }
}

export class Error<V> extends NoValue<V> {
  error: any;
  constructor(error: any) {
    super()
    this.error = error
  }
  isError: boolean = true
  toString() { 
    return "<error> " + _.toString(this.error)
  }
}

export function initialEvent<V>(value: V): Initial<V> { return new Initial(value); }
export function nextEvent<V>(value: V): Next<V> { return new Next(value); }
export function endEvent<V>(): End<V> { return new End(); }
export function toEvent<V>(x: V | Event<V>): Event<V> {
  if (x && (<any>x)._isEvent) {
    return <Event<V>>x;
  } else {
    return nextEvent(<V>x);
  }
}
export default Event

export function isEvent<V>(e): e is Event<V> {
  return e && e._isEvent
}

export function isError<V>(e: Event<V>): e is Error<V> {
  return e.isError
}

export function hasValue<V>(e: Event<V>): e is Value<V> {
  return e.hasValue
}

export function isEnd<V>(e: Event<V>): e is End<V> {
  return e.isEnd
}