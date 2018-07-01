import Observable from "./observable";
import { EventSink, Unsub } from "./types";

interface Event<V> {
  value: V
}

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

  mayHave(count): boolean { return true; }

  abstract hasAtLeast(count): boolean

  abstract push(event: Event<In>)
}

export class DefaultSource<V> extends Source<V, V> {
  value: Event<V> | undefined

  consume(): Event<V> | undefined {
    return this.value
  }

  push(x: Event<V>) {
    this.value = x
  }

  hasAtLeast(c) {
    return !!this.value
  }
}

export class ConsumingSource<V> extends Source<V, V> {
  flatten = false
  queue: Event<V>[] = []

  constructor(obs: Observable<V>, sync) {
    super(obs, sync)
  }
  consume(): Event<V> | undefined {
    return this.queue.shift();
  }
  push(x: Event<V>) {
    return this.queue.push(x);
  }
  mayHave(count) {
    return !this.ended || this.queue.length >= count;
  }
  hasAtLeast(count) {
    return this.queue.length >= count;
  }
}

export class BufferingSource<V> extends Source<V, V[]> {
  queue: V[] = []

  constructor(obs) {
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
  hasAtLeast(count) {
    return true;
  }
}


export function isTrigger(s): boolean {
  if (s == null) return false
  if (s._isSource) {
    return s.sync;
  } else {
    return s._isEventStream
  }
}

export function fromObservable<V>(s: Source<V, V> | Observable<V>): Source<V, V> {
  if (s != null && (<any>s)._isSource) {
    return <Source<V, V>>s;
  } else if (s != null && (<any>s)._isProperty) {
    return new DefaultSource<V>(<Observable<V>>s, false);
  } else {
    return new ConsumingSource<V>(<Observable<V>>s, true);
  }
}
