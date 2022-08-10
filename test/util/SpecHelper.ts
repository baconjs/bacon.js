require('es6-promise').polyfill();
import * as Bacon from "../..";
import { expect } from "chai";

import { TickScheduler } from "./TickScheduler";
import { mockFunction } from "./Mock"
import { fail } from "assert";

export const sc = TickScheduler();
Bacon.setScheduler(sc);

export const expectError = (errorText: string, f: any) => expect(f).to.throw(Error, errorText);
export const lessThan = (limit: number) => (x: number) => x < limit;
export const times = (x: number, y: number) => x * y;
export const add = (x: number, y: number) => x + y;
export const id = (x: any) => x;

export const activate = (obs: Bacon.Observable<any>) => {
  obs.onValue(() => undefined);
  return obs;
};

export const take = (count: number, obs: Bacon.Observable<any>) => obs.take(count);
export const map = (obs: Bacon.Observable<any>, f: any) => obs.map(f);
export const skip = (count: number, obs: Bacon.Observable<any>) => obs.skip(count);
export const later = (delay: number, value: any = "defaultEvent") => Bacon.later(delay, value);

export const fromPoll = Bacon.fromPoll;
export const sequentially = Bacon.sequentially;
export const repeatedly = Bacon.repeatedly;
export const fromArray = Bacon.fromArray;
export const once = Bacon.once;
export const mergeAll = Bacon.mergeAll;

export const testSideEffects = (wrapper: Function, method: string) => () =>
    it("(f) calls function with property value", () => {
      const f = mockFunction()
      wrapper("kaboom")[method](f)
      deferred(() => f.verify("kaboom"))
    })

export const t = id
let seqs: any[] = [];

const verifyCleanup_ = () => {
  for (let seq of seqs) {
    expect(seq.source.dispatcher.hasSubscribers()).to.deep.equal(false);
  }
  seqs = [];
};

function regSrc<V>(source: Bacon.EventStream<V>) {
  seqs.push({ source });
  return source;
};

export function series<V>(interval: number, values: (V | Bacon.Event<V>)[]): Bacon.EventStream<V> { return regSrc(sequentially<V>(t(interval), values)) }
export function repeat<V>(interval: number, values: (V | Bacon.Event<V>)[]): Bacon.EventStream<V> { return regSrc(repeatedly<V>(t(interval), values)) }
export function error(msg: string = "") { return new Bacon.Error(msg) }
export function soon(f: any) { setTimeout(f, t(1)) };

declare global {
  interface Array<T> {
      extraTest: string
  }
}

Array.prototype.extraTest = "Testing how this works with extra fields in Array prototype";

// Some streams are (semi)unstable when testing with verifySwitching2.
// Generally, all flatMap-based streams are at least semi-unstable because flatMap discards
// child streams on unsubscribe.
//
// semiunstable=events may be lost if subscribers are removed altogether between events
// unstable=events may be inconsistent for subscribers that are added between events
export const unstable = { unstable: true, semiunstable: true };
export const semiunstable = { semiunstable: true };

export const atGivenTimes = (timesAndValues: any[]) => {
  const startTime = sc.now();
  return Bacon.fromBinder((sink) => {
    let shouldStop = false;
    var schedule = (timeOffset: number, index: number) => {
      const first = timesAndValues[index];
      const scheduledTime = first[0];
      const delay = (scheduledTime - sc.now()) + startTime;
      const push = () => {
        if (shouldStop) {
          return;
        }
        const value = first[1];
        sink(new Bacon.Next(value));
        if (!shouldStop && ((index+1) < timesAndValues.length)) {
          return schedule(scheduledTime, index+1);
        } else {
          return sink(new Bacon.End());
        }
      };
      return sc.setTimeout(push, delay);
    };
    schedule(0, 0);
    return () => shouldStop = true;
  });
};


const browser = (typeof window === "object");
if (browser) {
  console.log("Running in browser, narrowing test set");
}

export const expectStreamTimings = (src: () => Bacon.EventStream<any>, expectedEventsAndTimings: any[], options: any = undefined) => {
  const srcWithRelativeTime = () => {
    const { now } = sc;
    const t0 = now();
    const relativeTime = () => Math.floor(now() - t0);
    const withRelativeTime = (x: any) => [relativeTime(), x];
    return src().transform((e, sink) => {
      e = e.fmap(withRelativeTime);
      return sink(e);
    });
  };
  return expectStreamEvents(srcWithRelativeTime, expectedEventsAndTimings, options);
};

export const expectStreamEvents = (src: () => Bacon.Observable<any>, expectedEvents: any[], param: any = undefined) => {
  return verifySingleSubscriber(src, expectedEvents);
};

export const expectPropertyEvents = (src: () => Bacon.Observable<any>, expectedEvents: any[], param: any = {}) => {
  const {unstable, semiunstable, extraCheck} = param;
  expect(expectedEvents.length > 0).to.deep.equal(true, "at least one expected event is specified");
  verifyPSingleSubscriber(src, expectedEvents, extraCheck);
  if (!browser) {
    verifyPLateEval(src, expectedEvents);
    if (!unstable) {
      verifyPIntermittentSubscriber(src, expectedEvents);
      verifyPSwitching(src, justValues(expectedEvents));
    }
    if (!(unstable || semiunstable)) {
      return verifyPSwitchingAggressively(src, justValues(expectedEvents));
    }
  }
};

var verifyPSingleSubscriber = (srcF: () => Bacon.Observable<any>, expectedEvents: Bacon.Event<any>[], extraCheck: (Function | undefined) = undefined) =>
  verifyPropertyWith("(single subscriber)", srcF, expectedEvents, ((src: Bacon.Observable<any>, events: Bacon.Event<any>[], done: (err: (Error | void)) => any) => {
    let gotInitial = false;
    let gotNext = false;
    let sync = true;
    src.subscribe((event: Bacon.Event<any>) => {
      if (event.isEnd) {
        done(undefined);
        return Bacon.noMore;
      } else {
        if (event.isInitial) {
          if (gotInitial) { done(new Error(`got more than one Initial event: ${toValue(event)}`)); }
          if (gotNext) { done(new Error(`got Initial event after the Next one: ${toValue(event)}`)); }
          if (!sync) { done(new Error(`got async Initial event: ${toValue(event)}`)); }
          gotInitial = true;
        } else if (event.hasValue) {
          gotNext = true;
        }
        events.push(event);
        return Bacon.more
      }
    });
    return sync = false;
  }), extraCheck)
;

var verifyPLateEval = (srcF: () => Bacon.Observable<any>, expectedEvents: Bacon.Event<any>[]) =>
  verifyPropertyWith("(late eval)", srcF, expectedEvents, (src: Bacon.Observable<any>, events: Bacon.Event<any>[], done: () => any) =>
    src.subscribe((event) => {
      if (event.isEnd) {
        return done();
      } else {
        return events.push(event);
      }
    })
  )
;

var verifyPIntermittentSubscriber = (srcF: () => Bacon.Observable<any>, expectedEvents: Bacon.Event<any>[]) =>
  verifyPropertyWith("(with intermittent subscriber)", srcF, expectedEvents, (src, events, done) => {
    const otherEvents: Bacon.Event<any>[] = [];
    take(1, src).subscribe((e: Bacon.Event<any>) => {
      otherEvents.push(e)
      return undefined;
    });
    return src.subscribe((event: Bacon.Event<any>) => {
      if (event.isEnd) {
        const expectedValues = events.filter(e => e.hasValue).slice(0, 1);
        const gotValues = otherEvents.filter(e => e.hasValue);
        // verify that the "side subscriber" got expected values
        expect(toValues(gotValues)).to.deep.equal(toValues(expectedValues));
        done();
        return Bacon.noMore
      } else {
        events.push(event);
        return Bacon.more
      }
    });
  })
;

const verifyPSwitching = (srcF: () => Bacon.Observable<any>, expectedEvents: Bacon.Event<any>[]) =>
  verifyPropertyWith("(switching subscribers)", srcF, expectedEvents, (src, events, done) =>
    src.subscribe((event: Bacon.Event<any>) => {
      if (event.isEnd) {
        done();
        return Bacon.noMore;
      } else {
        if (event.hasValue) {
          src.subscribe((event: Bacon.Event<any>) => {
            if (Bacon.isInitial(event)) {
              events.push(event);
            }
            return Bacon.noMore;
          });
        }
      }
    })
  )
;

const verifyPSwitchingAggressively = (srcF: () => Bacon.Observable<any>, expectedEvents: Bacon.Event<any>[]) =>
  describe("(switching aggressively)", () => {
    let src: Bacon.Observable<any>;
    const events: Bacon.Event<any>[] = [];
    let idCounter = 0;
    before(() => src = srcF());
    before((done) => {
      let unsub: (Bacon.Unsub | null);
      var newSink = () => {
        const myId = ++idCounter;
        //console.log "new sub", myId
        unsub = null;
        let gotMine = false;
        return (event: Bacon.Event<any>) => {
          //console.log "at", sc.now(), "got", event, "for", myId
          if (event.isEnd && (myId === idCounter)) {
            done();
            return Bacon.noMore
          } else if (event.hasValue) {
            if (gotMine) {
              //console.log "  -> ditch it"
              if (unsub != null) {
                unsub();
              }
              unsub = src.subscribe(newSink());
              return Bacon.noMore;
            } else {
              //console.log "  -> take it"
              gotMine = true;
              events.push(toValue(event));
              return Bacon.more
            }
          }
        };
      };
      return unsub = src.subscribe(newSink());
    });
    it("outputs expected values in order", () => expect(events).to.deep.equal(toValues(expectedEvents)));
  })
;

const verifyPropertyWith = (description: string, srcF: () => Bacon.Observable<any>, expectedEvents: Bacon.Event<any>[], collectF: (src: Bacon.Observable<any>, events: Bacon.Event<any>[], done: () => void) => void, extraCheck: (Function | undefined) = undefined) =>
  describe(description, () => {
    let src: Bacon.Observable<any>;
    const events: Bacon.Event<any>[] = [];
    before(() => src = srcF());
    before(done => collectF(src, events, done));
    it("is a Property", () => expect((<any>src)._isProperty).to.deep.equal(true));
    it("outputs expected events in order", () => expect(toValues(events)).to.deep.equal(toValues(expectedEvents)));
    it("has correct final state", () => verifyFinalState(src, lastNonError(expectedEvents)));
    it("cleans up observers", verifyCleanup_);
    if (extraCheck != undefined) {
      extraCheck();
    }
  })
;

export const verifySingleSubscriber = (srcF: () => Bacon.Observable<any>, expectedEvents: any[]) => {
  return verifyStreamWith("(single subscriber)", srcF, expectedEvents, (src, events, done) =>
    src.subscribe((event: Bacon.Event<any>) => {
      if (Bacon.isInitial(event)) {
        fail("Got Initial event from stream")
      }
      if (event.isEnd) {
        done();
        return undefined;
      } else {
        expect(event.isInitial).to.deep.equal(false, "no Initial events");
        events.push(toValue(event));
        return undefined;
      }
    })
  )
};

const verifyStreamWith = (description: string, srcF: () => Bacon.Observable<any>, expectedEvents: Bacon.Event<any>[], collectF: (src: Bacon.Observable<any>, events: Bacon.Event<any>[], done: () => void) => any) =>
  describe(description, () => {
    let src: Bacon.Observable<any>;
    const events: Bacon.Event<any>[] = [];

    before(() => {
      src = srcF();
      expect((<any>src)._isEventStream).to.equal(true, "is an EventStream");
    });
    before(done => collectF(src, events, done));
    it("outputs expected values in order", () => expect(toValues(events)).to.deep.equal(toValues(expectedEvents)));
    it("the stream is exhausted", () => verifyExhausted(src));
    it("cleans up observers", verifyCleanup_);
  })
;

const verifyExhausted = (src: Bacon.Observable<any>) => {
  const events: Bacon.Event<any>[] = [];
  src.subscribe((event: Bacon.Event<any>) => {
    if (event === undefined) {
      throw new Error("got undefined event");
    }
    events.push(event);
    return Bacon.more
  });
  if (events.length === 0) {
    throw new Error("got zero events");
  }
  expect(events[0].isEnd).to.deep.equal(true);
};

export const verifyCleanup = () =>
  deferred(() => {
    for (let seq of seqs) {
      expect(seq.source.dispatcher.hasSubscribers()).to.deep.equal(false);
    }
    return seqs = [];
  })

var lastNonError = (events: Bacon.Event<any>[]) => Bacon._.last(Bacon._.filter((e => toValue(e) !== "<error>"), events));

var verifyFinalState = (property: Bacon.Observable<any>, value: any) => {
  const events: Bacon.Event<any>[] = [];
  property.subscribe((event: Bacon.Event<any>) => {
    events.push(event)
    return Bacon.more;
  });
  return expect(toValues(events)).to.deep.equal(toValues([value, "<end>"]));
};

export const toValues = (xs: any[]) => xs.map(toValue);
export const toValue = (x: any) => {
  switch (true) {
    case !(x != null ? x.isEvent : undefined): return x;
    case x.isError: return "<error>";
    case x.isEnd: return "<end>";
    default: return x.value;
  }
};

var justValues = (xs: any[]) => Bacon._.filter(hasValue, xs);

var hasValue = (x: any) => toValue(x) !== "<error>";

declare var Promise: any

export const deferred = (f: () => any) =>
  new Promise((resolve: () => void) => {
    return setTimeout((() => {
      f();
      return resolve();
    }), 1);
  })

export const onUnsub: (stream: Bacon.EventStream<any>, f: () => any) => Bacon.EventStream<any> = (stream, f) => {
  const desc = new Bacon.Desc(stream, "onUnsub", []);
  new Bacon.EventStream(desc, (sink: Bacon.EventSink<any>) => {
    const unsub = stream.subscribe(sink);
    return () => {
      f();
      unsub();
    };
  });
  return stream;
};

export function range(left: number, right: number, inclusive: boolean) {
  let range: Array<number> = [];
  let ascending = left < right;
  let end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}
