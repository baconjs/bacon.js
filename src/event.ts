import _ from './_';

var eventIdCounter = 0;

export abstract class Event<V> {
  value?: V // TODO remove from base
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

export function initialEvent(value) { return new Initial(value); }
export function nextEvent(value) { return new Next(value); }
export function endEvent() { return new End(); }
export function toEvent(x: any) {
  if (x && x._isEvent) {
    return x;
  } else {
    return nextEvent(x);
  }
}
