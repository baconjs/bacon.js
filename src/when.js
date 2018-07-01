import { Desc } from "./describe";
import CompositeUnsubscribe from "./compositeunsubscribe";
import EventStream from "./eventstream";
import UpdateBarrier from "./updatebarrier";
import { isTrigger, fromObservable } from "./source";
import { endEvent } from "./event";
import { more, noMore } from "./reply";
import _ from "./_";
import { assert } from "./helpers";
import never from "./never";
import Bacon from "./core";
import propertyFromStreamSubscribe from "./propertyfromstreamsubscribe"

function newEventStream(...args) {
  return new EventStream(...args)
}

export function when() {
  return when_(newEventStream, arguments)
}

export function whenP() {
  return when_(propertyFromStreamSubscribe, arguments)
}

export default when;

function extractPatternsAndSources(sourceArgs) {
  var len = sourceArgs.length;
  var sources = [];
  var pats = [];
  var i = 0;
  var patterns = [];
  while (i < len) {
    patterns[i] = sourceArgs[i];
    patterns[i + 1] = sourceArgs[i + 1];
    var patSources = _.toArray(sourceArgs[i]);
    var f = constantToFunction(sourceArgs[i + 1]);
    var pat = {f, ixs: []};
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
      for (var k = 0, ix; k < pat.ixs.length; k++) {
        ix = pat.ixs[k];
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
  return [sources, pats, patterns]
}

export function when_(ctor, sourceArgs) {
  if (sourceArgs.length === 0) { return never(); }
  var [sources, pats, patterns] = extractPatternsAndSources(sourceArgs)


  if (!sources.length) {
    return never();
  }

  sources = _.map(fromObservable, sources);
  var needsBarrier = (_.any(sources, s => s.flatten)) && containsDuplicateDeps(_.map((s => s.obs), sources));

  var desc = new Desc(Bacon, "when", patterns);
  var resultStream = ctor(desc, function(sink) {
    var triggers = [];
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
    function cannotMatch(p) {
      for (var i = 0; i < p.ixs.length; i++) {
        let ix = p.ixs[i];
        if (!sources[ix.index].mayHave(ix.count)) {
          return true;
        }
      }
    }
    function nonFlattened(trigger) { return !trigger.source.flatten; }
    function part(source) { return function(unsubAll) {
      function flushLater() {
        return UpdateBarrier.whenDoneWith(resultStream, flush);
      }
      function flushWhileTriggers() {
        if (triggers.length > 0) {
          var reply = more;
          var trigger = triggers.pop();
          for (var i = 0, p; i < pats.length; i++) {
            p = pats[i];
            if (match(p)) {
              const values = [];
              for (var j = 0; j < p.ixs.length; j++) {
                let event = sources[p.ixs[j].index].consume()
                values.push(event.value);
              }
              //console.log("flushing values", values)
              let applied = p.f.apply(null, values);
              //console.log('sinking', applied)
              reply = sink(trigger.e.apply(applied));
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
      function flush() {
        //console.log "flushing", _.toString(resultStream)
        var reply = flushWhileTriggers();
        if (ends) {
          //console.log "ends detected"
          if  (_.all(sources, cannotSync) || _.all(pats, cannotMatch)) {
            //console.log "actually ending"
            reply = noMore;
            sink(endEvent());
          }
        }
        if (reply === noMore) { unsubAll(); }
        //console.log "flushed"
        return reply;
      }
      return source.subscribe(function(e) {
        if (e.isEnd) {
          //console.log "got end"
          ends = true;
          source.markEnded();
          flushLater();
        } else if (e.isError) {
          var reply = sink(e);
        } else {
          //console.log "got value", e.value
          source.push(e);
          if (source.sync) {
            //console.log "queuing", e.toString(), _.toString(resultStream)
            triggers.push({source: source, e: e});
            if (needsBarrier || UpdateBarrier.hasWaiters()) { flushLater(); } else { flush(); }
          }
        }
        if (reply === noMore) { unsubAll(); }
        return reply || more;
      });
    }
    }

    return new CompositeUnsubscribe((() => {
      var result = [];
      for (var i = 0, s; i < sources.length; i++) {
        s = sources[i];
        result.push(part(s));
      }
      return result;
    })()).unsubscribe;
  });
  return resultStream;
}

function containsDuplicateDeps(observables, state = []) {
  function checkObservable(obs) {
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

function constantToFunction(f) {
  if (_.isFunction(f)) {
    return f;
  } else {
    return _.always(f);
  }
}

function cannotSync(source) {
  return !source.sync || source.ended;
}

Bacon.when = when;
