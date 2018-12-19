import Observable from "../observable";
import { EventSink, Unsub } from "../types";

interface Event<V> {
  value: V
}
/** @hidden */
export abstract class Source<In, Out> {
  _isSource = true
  obs: Observable<In>
  sync: boolean
  flatten: boolean = true
  ended: boolean = false

  constructor(obs: Observable<In>, sync: boolean) {
    this.obs = obs;
    this.sync = sync;
  }

  subscribe(sink: EventSink<In>): Unsub {
    return this.obs.subscribeInternal(sink);
  }
  toString(): string {
    return this.obs.toString();
  }
  markEnded(): void {
    this.ended = true;
  }
  abstract consume(): Event<Out> | undefined

  mayHave(count: number): boolean { return true; }

  abstract hasAtLeast(count: number): boolean

  abstract push(event: Event<In>): void
}

/** @hidden */
export class DefaultSource<V> extends Source<V, V> {
  value: Event<V> | undefined

  consume(): Event<V> | undefined {
    return this.value
  }

  push(x: Event<V>): void {
    this.value = x
  }

  hasAtLeast(c: number) {
    return !!this.value
  }
}

/** @hidden */
export class ConsumingSource<V> extends Source<V, V> {
  flatten = false
  queue: Event<V>[] = []

  constructor(obs: Observable<V>, sync: boolean) {
    super(obs, sync)
  }
  consume(): Event<V> | undefined {
    return this.queue.shift();
  }
  push(x: Event<V>): void {
    this.queue.push(x);
  }
  mayHave(count: number) {
    return !this.ended || this.queue.length >= count;
  }
  hasAtLeast(count: number) {
    return this.queue.length >= count;
  }
}

/** @hidden */
export class BufferingSource<V> extends Source<V, V[]> {
  queue: V[] = []

  constructor(obs: Observable<V>) {
    super(obs, true)
  }

  consume(): Event<V[]> {
    const values = this.queue;
    this.queue = [];
    return {
      value: values
    };
  }
  push(x: Event<V>) {
    return this.queue.push(x.value);
  }
  hasAtLeast(count: number) {
    return true;
  }
}


/** @hidden */
export function isTrigger(s: any): boolean {
  if (s == null) return false
  if (s._isSource) {
    return s.sync;
  } else {
    return s._isEventStream
  }
}

/** @hidden */
export function fromObservable<V>(s: Source<V, V> | Observable<V>): Source<V, V> {
  if (s != null && (<any>s)._isSource) {
    return <Source<V, V>>s;
  } else if (s != null && (<any>s)._isProperty) {
    return new DefaultSource<V>(<Observable<V>>s, false);
  } else {
    return new ConsumingSource<V>(<Observable<V>>s, true);
  }
}
