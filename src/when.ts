import { Desc } from "./describe";
import CompositeUnsubscribe from "./compositeunsubscribe";
import { EventStream, newEventStream } from "./observable";
import UpdateBarrier from "./internal/updatebarrier";
import { fromObservable, isTrigger, Source } from "./internal/source";
import { endEvent, Event, Value } from "./event";
import { more, noMore, Reply } from "./reply";
import { all, map, toArray, toFunction, contains, any, indexOf, filter } from "./_";
import { assert } from "./internal/assert";
import never from "./never";
import propertyFromStreamSubscribe from "./internal/propertyfromstreamsubscribe"
import Observable, { ObservableConstructor } from "./observable";
import { Unsub } from "./types";
import { Property } from "./observable";
import { isObservable } from "./helpers";

export type ObservableOrSource<V> = Observable<V> | Source<any, V>

/**
 *  Join pattern consisting of a single EventStream and a mapping function.
 */
export type Pattern1<I1,O> = [ObservableOrSource<I1>, (a: I1) => O]
/**
 *  Join pattern consisting of a 2 Observables and a combinator function. At least one of the Observables must be an EventStream.
 */
export type Pattern2<I1,I2,O> = [ObservableOrSource<I1>, ObservableOrSource<I1>, (a: I1, b: I2) => O]
/**
 *  Join pattern consisting of a 3 Observables and a combinator function. At least one of the Observables must be an EventStream.
 */
export type Pattern3<I1,I2,I3,O> = [ObservableOrSource<I1>, ObservableOrSource<I1>, ObservableOrSource<I3>, (a: I1, b: I2, c: I3) => O]
/**
 *  Join pattern consisting of a 4 Observables and a combinator function. At least one of the Observables must be an EventStream.
 */
export type Pattern4<I1,I2,I3,I4,O> = [ObservableOrSource<I1>, ObservableOrSource<I1>, ObservableOrSource<I3>, ObservableOrSource<I4>, (a: I1, b: I2, c: I3, d: I4) => O]
/**
 *  Join pattern consisting of a 5 Observables and a combinator function. At least one of the Observables must be an EventStream.
 */
export type Pattern5<I1,I2,I3,I4,I5,O> = [ObservableOrSource<I1>, ObservableOrSource<I1>, ObservableOrSource<I3>, ObservableOrSource<I4>, ObservableOrSource<I5>, (a: I1, b: I2, c: I3, d: I4, e: I5) => O]
/**
 *  Join pattern consisting of a 6 Observables and a combinator function. At least one of the Observables must be an EventStream.
 */
export type Pattern6<I1,I2,I3,I4,I5,I6,O> = [ObservableOrSource<I1>, ObservableOrSource<I1>, ObservableOrSource<I3>, ObservableOrSource<I4>, ObservableOrSource<I5>, ObservableOrSource<I6>, (a: I1, b: I2, c: I3, d: I4, e: I5, f: I6) => O]
/** @hidden */
export type RawPattern = [AnyObservableOrSource[], AnyFunction]
/**
 *  Join pattern type, allowing up to 6 sources per pattern.
 */
export type Pattern<O> = Pattern1<any, O> | Pattern2<any, any, O> | Pattern3<any, any, any, O> |
                         Pattern4<any, any, any, any, O> | Pattern5<any, any, any, any, any, O> | Pattern6<any, any, any, any, any, any, O> |
                         RawPattern

/** @hidden */
export type AnySource = Source<any, any>
/** @hidden */
export type AnyFunction = Function
type AnyValue = Value<any>
/** @hidden */
export type AnyObservable = Observable<any>
/** @hidden */
export type AnyObservableOrSource = AnyObservable | AnySource

/**
 The `when` method provides a generalization of the [`zip`](classes/observable.html#zip) function. While zip
 synchronizes events from multiple streams pairwse, the join patterns used in `when` allow
 the implementation of more advanced synchronization patterns.

 Consider implementing a game with discrete time ticks. We want to
 handle key-events synchronized on tick-events, with at most one key
 event handled per tick. If there are no key events, we want to just
 process a tick.

 ```js
 Bacon.when(
 [tick, keyEvent, function(_, k) { handleKeyEvent(k); return handleTick(); }],
 [tick, handleTick])
 ```

 Order is important here. If the [tick] patterns had been written
 first, this would have been tried first, and preferred at each tick.

 Join patterns are indeed a generalization of zip, and for EventStreams, zip is
 equivalent to a single-rule join pattern. The following observables
 have the same output, assuming that all sources are EventStreams.

 ```js
 Bacon.zipWith(a,b,c, combine)
 Bacon.when([a,b,c], combine)
 ```

 Note that [`Bacon.when`](#bacon-when) does not trigger updates for events from Properties though;
 if you use a Property in your pattern, its value will be just sampled when all the
 other sources (EventStreams) have a value. This is useful when you need a value of a Property
 in your calculations. If you want your pattern to fire for a Property too, you can
 convert it into an EventStream using [`property.changes()`](#property-changes) or [`property.toEventStream()`](#property-toeventstream)

 * @param {Pattern<O>} patterns Join patterns
 * @typeparam O result type
 */
export function when<O>(...patterns: Pattern<O>[]): EventStream<O> {
  return <any>when_(newEventStream, patterns)
}

/** @hidden */
export function whenP<O>(...patterns: Pattern<O>[]): Property<O> {
  return <any>when_(propertyFromStreamSubscribe, patterns)
}

export default when;

/** @hidden */
export function when_<O>(ctor: ObservableConstructor, patterns: Pattern<O>[]): Observable<O> {
  if (patterns.length === 0) { return never() }
  var [sources, ixPats] = processRawPatterns(extractRawPatterns(patterns))

  if (!sources.length) {
    return never()
  }

  var needsBarrier: boolean = (any(sources, (s: AnySource) => s.flatten)) && containsDuplicateDeps(map(((s: AnySource) => s.obs), sources))

  var desc = new Desc("Bacon", "when", Array.prototype.slice.call(patterns))

  var resultStream = ctor(desc, function(sink) {
    var triggers: Trigger[] = [];
    var ends = false;
    function match(p: IndexPattern) {
      for (var i = 0; i < p.ixs.length; i++) {
        let ix = p.ixs[i];
        if (!sources[ix.index].hasAtLeast(ix.count)) {
          return false;
        }
      }
      return true;
    }
    function cannotMatch(p: IndexPattern): boolean {
      for (var i = 0; i < p.ixs.length; i++) {
        let ix = p.ixs[i];
        if (!sources[ix.index].mayHave(ix.count)) {
          return true;
        }
      }
      return false
    }
    function nonFlattened(trigger: Trigger): boolean { return !trigger.source.flatten; }
    function part(source: AnySource): (u: Unsub) => Unsub { return function(unsubAll): Unsub {
      function flushLater() {
        return UpdateBarrier.whenDoneWith(resultStream, flush);
      }
      function flushWhileTriggers(): Reply {
        var trigger: Trigger | undefined
        if ((trigger = triggers.pop()) !== undefined) {
          var reply = more;
          for (var i = 0, p; i < ixPats.length; i++) {
            p = ixPats[i];
            if (match(p)) {
              const values: any[] = [];
              for (var j = 0; j < p.ixs.length; j++) {
                let event = sources[p.ixs[j].index].consume()
                if (!event) throw new Error("Event was undefined")
                values.push(event.value);
              }
              //console.log("flushing values", values)
              let applied = p.f.apply(null, values);
              //console.log('sinking', applied)
              reply = sink((trigger).e.apply(applied));
              if (triggers.length) {
                triggers = filter(nonFlattened, triggers);
              }
              if (reply === noMore) {
                return reply;
              } else {
                return flushWhileTriggers();
              }
            }
          }
        }
        return more;
      }
      function flush(): void {
        //console.log "flushing", _.toString(resultStream)
        var reply: Reply = flushWhileTriggers();
        if (ends) {
          //console.log "ends detected"
          if  (all(sources, cannotSync) || all(ixPats, cannotMatch)) {
            //console.log "actually ending"
            reply = noMore;
            sink(endEvent());
          }
        }
        if (reply === noMore) { unsubAll(); }
      }

      return source.subscribe(function(e: Event<any>) {
        var reply = more
        if (e.isEnd) {
          //console.log "got end"
          ends = true;
          source.markEnded();
          flushLater();
        } else if (e.isError) {
          reply = sink(e);
        } else {
          let valueEvent = <AnyValue>e
          //console.log "got value", e.value
          source.push(valueEvent);
          if (source.sync) {
            //console.log "queuing", e.toString(), toString(resultStream)
            triggers.push({source: source, e: valueEvent});
            if (needsBarrier || UpdateBarrier.hasWaiters()) { flushLater(); } else { flush(); }
          }
        }
        if (reply === noMore) { unsubAll(); }
        return reply;
      });
    }}

    return new CompositeUnsubscribe(map(part, sources)).unsubscribe;
  });
  return resultStream;
}

interface IndexPattern {
  ixs: { index: number, count: number }[]
  f: AnyFunction
}

function processRawPatterns(rawPatterns: RawPattern[]): [AnySource[], IndexPattern[]] {
  var sources: AnyObservableOrSource[] = [];
  var pats: IndexPattern[] = [];
  for (let i = 0; i < rawPatterns.length; i++) {

    let [patSources, f] = rawPatterns[i]
    var pat: IndexPattern = {f, ixs: []};
    var triggerFound = false;
    for (var j = 0, s; j < patSources.length; j++) {
      s = patSources[j];
      var index = indexOf(sources, s);
      if (!triggerFound) {
        triggerFound = isTrigger(s);
      }
      if (index < 0) {
        sources.push(s);
        index = sources.length - 1;
      }
      for (var k = 0; k < pat.ixs.length; k++) {
        let ix = pat.ixs[k];
        if (ix.index === index) {
          ix.count++;
        }
      }
      pat.ixs.push({index: index, count: 1});
    }

    if (patSources.length > 0 && !triggerFound) {
      throw new Error("At least one EventStream required, none found in " + patSources)
    }

    if (patSources.length > 0) {
      pats.push(pat);
    }
  }
  return [map(fromObservable, sources), pats]
}

function extractLegacyPatterns(sourceArgs: any[]): RawPattern[] {
  var i = 0
  var len = sourceArgs.length;
  var rawPatterns: RawPattern[] = []
  while (i < len) {
    let patSources: AnyObservableOrSource[] = toArray(sourceArgs[i++]);
    let f: AnyFunction = toFunction(sourceArgs[i++]);
    rawPatterns.push([patSources, f])
  }
  var usage = "when: expecting arguments in the form (Observable+,function)+";
  assert(usage, (len % 2 === 0));

  return rawPatterns
}

function isTypedOrRawPattern(pattern: Pattern<any>) {
  return (pattern instanceof Array) && (!isObservable(pattern[pattern.length - 1]))
}

function isRawPattern(pattern: Pattern<any>): pattern is RawPattern {
  return pattern[0] instanceof Array
}

/** @hidden */
export function extractRawPatterns<O>(patterns: Pattern<O>[]): RawPattern[] {
  let rawPatterns: RawPattern[] = []
  for (let i = 0; i < patterns.length; i++) {
    let pattern = patterns[i]
    if (!isTypedOrRawPattern(pattern)) {
      // Fallback to legacy patterns
      return extractLegacyPatterns(patterns)
    }
    if (isRawPattern(pattern)) {
      rawPatterns.push([pattern[0], toFunction(pattern[1])])
    } else { // typed pattern, then
      let sources: AnySource[] = <any>pattern.slice(0, pattern.length - 1)
      let f: AnyFunction = <any>toFunction(<any>pattern[pattern.length - 1])
      rawPatterns.push([sources, f])
    }
  }
  return rawPatterns
}

interface Trigger {
  e: Value<any>
  source: AnySource
}

function containsDuplicateDeps(observables: AnyObservable[], state: AnyObservable[] = []) {
  function checkObservable(obs: AnyObservable): boolean {
    if (contains(state, obs)) {
      return true;
    } else {
      var deps = obs.internalDeps();
      if (deps.length) {
        state.push(obs);
        return any(deps, checkObservable);
      } else {
        state.push(obs);
        return false;
      }
    }
  }

  return any(observables, checkObservable);
}

function cannotSync(source: AnySource) {
  return !source.sync || source.ended;
}
