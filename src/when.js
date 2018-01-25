import { Desc } from "./describe";
import CompositeUnsubscribe from "./compositeunsubscribe";
import EventStream from "./eventstream";
import UpdateBarrier from "./updatebarrier";
import { Source } from "./source";
import { endEvent } from "./event";
import { more, noMore } from "./reply";
import _ from "./_";
import { assert } from "./helpers";
import never from "./never";
import Bacon from "./core";

export default function when() {
  if (arguments.length === 0) { return never(); }
  var len = arguments.length;
  var usage = "when: expecting arguments in the form (Observable+,function)+";

  assert(usage, (len % 2 === 0));
  var sources = [];
  var pats = [];
  var i = 0;
  var patterns = [];
  while (i < len) {
    patterns[i] = arguments[i];
    patterns[i + 1] = arguments[i + 1];
    var patSources = _.toArray(arguments[i]);
    var f = constantToFunction(arguments[i + 1]);
    var pat = {f, ixs: []};
    var triggerFound = false;
    for (var j = 0, s; j < patSources.length; j++) {
      s = patSources[j];
      var index = _.indexOf(sources, s);
      if (!triggerFound) {
        triggerFound = Source.isTrigger(s);
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

  if (!sources.length) {
    return never();
  }

  sources = _.map(Source.fromObservable, sources);
  var needsBarrier = (_.any(sources, function(s) { return s.flatten; })) && containsDuplicateDeps(_.map((function(s) { return s.obs; }), sources));

  var desc = new Desc(Bacon, "when", patterns);
  var resultStream = new EventStream(desc, function(sink) {
    var triggers = [];
    var ends = false;
    var match = function(p) {
      for (var i1 = 0, i; i1 < p.ixs.length; i1++) {
        i = p.ixs[i1];
        if (!sources[i.index].hasAtLeast(i.count)) {
          return false;
        }
      }
      return true;
    };
    var cannotSync = function(source) {
      return !source.sync || source.ended;
    };
    var cannotMatch = function(p) {
      for (var i1 = 0, i; i1 < p.ixs.length; i1++) {
        i = p.ixs[i1];
        if (!sources[i.index].mayHave(i.count)) {
          return true;
        }
      }
    };
    var nonFlattened = function(trigger) { return !trigger.source.flatten; };
    var part = function(source) { return function(unsubAll) {
      var flushLater = function() {
        return UpdateBarrier.whenDoneWith(resultStream, flush);
      };
      var flushWhileTriggers = function() {
        if (triggers.length > 0) {
          var reply = more;
          var trigger = triggers.pop();
          for (var i1 = 0, p; i1 < pats.length; i1++) {
            p = pats[i1];
            if (match(p)) {
              //console.log "match", p
              // TODO: simplify
              var events = ((() => {
                var result = [];
                for (var i2 = 0, i; i2 < p.ixs.length; i2++) {
                  i = p.ixs[i2];
                  result.push(sources[i.index].consume());
                }
                return result;
              })());
              var values = ((() => {
                var result = [];
                for (var i2 = 0, event; i2 < events.length; i2++) {
                  event = events[i2];
                  result.push(event.value);
                }
                return result;
              })());
              //console.log("flushing values", values)
              let applied = p.f(...values);
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
      };
      var flush = function() {
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
      };
      return source.subscribe(function(e) {
        if (e.isEnd()) {
          //console.log "got end"
          ends = true;
          source.markEnded();
          flushLater();
        } else if (e.isError()) {
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
    };
    };

    return new CompositeUnsubscribe((() => {
      var result = [];
      for (var i1 = 0, s; i1 < sources.length; i1++) {
        s = sources[i1];
        result.push(part(s));
      }
      return result;
    })()).unsubscribe;
  });
  return resultStream;
}

var containsDuplicateDeps = function(observables, state = []) {
  var checkObservable = function(obs) {
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
  };

  return _.any(observables, checkObservable);
};

var constantToFunction = function(f) {
  if (_.isFunction(f)) {
    return f;
  } else {
    return _.always(f);
  }
};

Bacon.when = when;
