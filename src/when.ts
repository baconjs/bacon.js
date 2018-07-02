import { Desc } from "./describe";
import CompositeUnsubscribe from "./compositeunsubscribe";
import EventStream from "./eventstream";
import UpdateBarrier from "./updatebarrier";
import { fromObservable, isTrigger, Source } from "./source";
import { endEvent, Event, Value } from "./event";
import { more, noMore, Reply } from "./reply";
import _ from "./_";
import { assert } from "./assert";
import never from "./never";
import Bacon from "./core";
import propertyFromStreamSubscribe from "./propertyfromstreamsubscribe"
import Observable from "./observable";
import { Subscribe, Unsub } from "./types";
import Property from "./property";


export type ObservableOrSource<V> = Observable<V> | Source<any, V>

export type Pattern1<I1,O> = [ObservableOrSource<I1>, (I1) => O]
export type Pattern2<I1,I2,O> = [ObservableOrSource<I1>, ObservableOrSource<I1>, (I1, I2) => O]
export type Pattern3<I1,I2,I3,O> = [ObservableOrSource<I1>, ObservableOrSource<I1>, ObservableOrSource<I3>, (I1, I2, I3) => O]
export type Pattern4<I1,I2,I3,I4,O> = [ObservableOrSource<I1>, ObservableOrSource<I1>, ObservableOrSource<I3>, ObservableOrSource<I4>, (I1, I2, I3, I4) => O]
export type Pattern5<I1,I2,I3,I4,I5,O> = [ObservableOrSource<I1>, ObservableOrSource<I1>, ObservableOrSource<I3>, ObservableOrSource<I4>, ObservableOrSource<I5>, (I1, I2, I3, I4, I5) => O]
export type Pattern6<I1,I2,I3,I4,I5,I6,O> = [ObservableOrSource<I1>, ObservableOrSource<I1>, ObservableOrSource<I3>, ObservableOrSource<I4>, ObservableOrSource<I5>, ObservableOrSource<I6>, (I1, I2, I3, I4, I5, I6) => O]
export type RawPattern = [AnyObservableOrSource[], AnyFunction]
export type Pattern<O> = Pattern1<any, O> | Pattern2<any, any, O> | Pattern3<any, any, any, O> |
                         Pattern4<any, any, any, any, O> | Pattern5<any, any, any, any, any, O> | Pattern6<any, any, any, any, any, any, O> |
                         RawPattern

export type AnySource = Source<any, any>
export type AnyFunction = Function
type AnyValue = Value<any>
export type AnyObservable = Observable<any>
export type AnyObservableOrSource = AnyObservable | AnySource

function newEventStream<V>(description: Desc, subscribe: Subscribe<V>) {
  return new EventStream(description, subscribe)
}

export function when<O>(...patterns: Pattern<O>[]): EventStream<O> {
  return <any>when_(newEventStream, patterns)
}

export function whenP<O>(...patterns: Pattern<O>[]): Property<O> {
  return <any>when_(propertyFromStreamSubscribe, patterns)
}

export default when;

export interface ObservableConstructor {
  (description: Desc, subscribe: Subscribe<any>): Observable<any>
}

export function when_<O>(ctor: ObservableConstructor, patterns: Pattern<O>[]): Observable<O> {
  if (patterns.length === 0) { return never() }
  var [sources, ixPats] = processRawPatterns(extractTypedPatterns(patterns))

  if (!sources.length) {
    return never()
  }

  var needsBarrier: boolean = (_.any(sources, s => s.flatten)) && containsDuplicateDeps(_.map((s => s.obs), sources))

  var desc = new Desc(Bacon, "when", Array.prototype.slice.call(patterns))

  var resultStream = ctor(desc, function(sink) {
    var triggers: Trigger[] = [];
    var ends = false;
    function match(p) {
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
    function part(source: AnySource): (Unsub) => Unsub { return function(unsubAll): Unsub {
      function flushLater() {
        return UpdateBarrier.whenDoneWith(resultStream, flush);
      }
      function flushWhileTriggers(): Reply {
        var trigger: Trigger | undefined
        if ((trigger = triggers.pop()) !== undefined) {
          var reply = Reply.more;
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
                triggers = _.filter(nonFlattened, triggers);
              }
              if (reply === Reply.noMore) {
                return reply;
              } else {
                return flushWhileTriggers();
              }
            }
          }
        }
        return Reply.more;
      }
      function flush(): void {
        //console.log "flushing", _.toString(resultStream)
        var reply: Reply = flushWhileTriggers();
        if (ends) {
          //console.log "ends detected"
          if  (_.all(sources, cannotSync) || _.all(ixPats, cannotMatch)) {
            //console.log "actually ending"
            reply = Reply.noMore;
            sink(endEvent());
          }
        }
        if (reply === Reply.noMore) { unsubAll(); }
      }

      return source.subscribe(function(e: Event<any>) {
        if (e.isEnd) {
          //console.log "got end"
          ends = true;
          source.markEnded();
          flushLater();
        } else if (e.isError) {
          var reply = sink(e);
        } else {
          let valueEvent = <AnyValue>e
          //console.log "got value", e.value
          source.push(valueEvent);
          if (source.sync) {
            //console.log "queuing", e.toString(), _.toString(resultStream)
            triggers.push({source: source, e: valueEvent});
            if (needsBarrier || UpdateBarrier.hasWaiters()) { flushLater(); } else { flush(); }
          }
        }
        if (reply === noMore) { unsubAll(); }
        return reply || more;
      });
    }}

    return new CompositeUnsubscribe(_.map(part, sources)).unsubscribe;
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
      var index = _.indexOf(sources, s);
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
  return [_.map(fromObservable, sources), pats]
}

function extractLegacyPatterns(sourceArgs: any[]): RawPattern[] {
  var i = 0
  var len = sourceArgs.length;
  var rawPatterns: RawPattern[] = []
  while (i < len) {
    let patSources: AnyObservableOrSource[] = _.toArray(sourceArgs[i++]);
    let f: AnyFunction = _.toFunction(sourceArgs[i++]);
    rawPatterns.push([patSources, f])
  }
  var usage = "when: expecting arguments in the form (Observable+,function)+";
  assert(usage, (len % 2 === 0));

  return rawPatterns
}

function isTypedOrRawPattern(pattern: Pattern<any>) {
  return (pattern instanceof Array) && (typeof pattern[pattern.length - 1] == "function")
}

function isRawPattern(pattern: Pattern<any>): pattern is RawPattern {
  return pattern[0] instanceof Array
}

function extractTypedPatterns<O>(patterns: Pattern<O>[]): RawPattern[] {
  let rawPatterns: RawPattern[] = []
  for (let i = 0; i < patterns.length; i++) {
    let pattern = patterns[i]
    if (!isTypedOrRawPattern(pattern)) {
      // Fallback to legacy patterns
      return extractLegacyPatterns(patterns)
    }
    if (isRawPattern(pattern)) {
      rawPatterns.push(pattern)
    } else { // typed pattern, then
      let sources: AnySource[] = <any>pattern.slice(0, pattern.length - 1)
      let f: AnyFunction = <any>pattern[pattern.length - 1]
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
  function checkObservable(obs: AnyObservable) {
    if (_.contains(state, obs)) {
      return true;
    } else {
      var deps = obs.internalDeps();
      if (deps.length) {
        state.push(obs);
        return _.any(deps, checkObservable);
      } else {
        state.push(obs);
        return false;
      }
    }
  }

  return _.any(observables, checkObservable);
}

function cannotSync(source: AnySource) {
  return !source.sync || source.ended;
}

Bacon.when = when;