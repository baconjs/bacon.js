import { Desc } from "./describe";
import CompositeUnsubscribe from "./compositeunsubscribe";
import EventStream from "./eventstream";
import UpdateBarrier from "./updatebarrier";
import { fromObservable, isTrigger, Source } from "./source";
import { endEvent, Value, Event } from "./event";
import { more, noMore, Reply } from "./reply";
import _ from "./_";
import { assert } from "./helpers";
import never from "./never";
import Bacon from "./core";
import propertyFromStreamSubscribe from "./propertyfromstreamsubscribe"
import Observable from "./observable";
import { Subscribe, Unsub } from "./types";

type AnySource = Source<any, any>
type AnyFunction = Function
type AnyValue = Value<any>
type AnyObservable = Observable<any>
type ObservableOrSource = AnyObservable | AnySource
interface Ctor {
  (description: Desc, subscribe: Subscribe<any>): Observable<any>
}
interface Pattern {
  ixs: { index: number, count: number }[]
  f: AnyFunction
}

function newEventStream<V>(description: Desc, subscribe: Subscribe<V>) {
  return new EventStream(description, subscribe)
}

export function when() {
  return when_(newEventStream, arguments)
}

export function whenP() {
  return when_(propertyFromStreamSubscribe, arguments)
}

export default when;

function extractPatternsAndSources(sourceArgs: any[]): [AnySource[], Pattern[]] {
  var len = sourceArgs.length;
  var sources: ObservableOrSource[] = [];
  var pats: Pattern[] = [];
  var i = 0;
  while (i < len) {
    var patSources: (AnySource | AnyObservable)[] = _.toArray(sourceArgs[i]);
    var f = _.toFunction(sourceArgs[i + 1]);
    var pat: Pattern = {f, ixs: []};
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

    assert("At least one EventStream required", (triggerFound || (!patSources.length)));

    if (patSources.length > 0) {
      pats.push(pat);
    }
    i = i + 2;
  }
  var usage = "when: expecting arguments in the form (Observable+,function)+";
  assert(usage, (len % 2 === 0));

  return [_.map(fromObservable, sources), pats]
}

interface Trigger {
  e: Value<any>
  source: AnySource
}

export function when_(ctor: Ctor, sourceArgs) {
  if (sourceArgs.length === 0) { return never() }
  var [sources, pats] = extractPatternsAndSources(sourceArgs)

  if (!sources.length) {
    return never()
  }


  var needsBarrier: boolean = (_.any(sources, s => s.flatten)) && containsDuplicateDeps(_.map((s => s.obs), sources))

  var desc = new Desc(Bacon, "when", Array.prototype.slice.call(sourceArgs))

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
    function cannotMatch(p: Pattern): boolean {
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
          var reply = more;
          for (var i = 0, p; i < pats.length; i++) {
            p = pats[i];
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
              if (reply === noMore) {
                return reply;
              } else {
                return flushWhileTriggers();
              }
            }
          }
        } else {
          return more;
        }
      }
      function flush(): void {
        //console.log "flushing", _.toString(resultStream)
        var reply: Reply = flushWhileTriggers();
        if (ends) {
          //console.log "ends detected"
          if  (_.all(sources, cannotSync) || _.all(pats, cannotMatch)) {
            //console.log "actually ending"
            reply = noMore;
            sink(endEvent());
          }
        }
        if (reply === noMore) { unsubAll(); }
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