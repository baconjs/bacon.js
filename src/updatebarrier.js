// build-dependencies: _

var UpdateBarrier = Bacon.UpdateBarrier = (function() {
  var rootEvent;
  var waiterObs = [];
  var waiters = {};
  var afters = [];
  var aftersIndex = 0;

  var afterTransaction = function(f) {
    if (rootEvent) {
      return afters.push(f);
    } else {
      return f();
    }
  };

  var whenDoneWith = function(obs, f) {
    if (rootEvent) {
      var obsWaiters = waiters[obs.id];
      if (!(typeof obsWaiters !== "undefined" && obsWaiters !== null)) {
        obsWaiters = waiters[obs.id] = [f];
        return waiterObs.push(obs);
      } else {
        return obsWaiters.push(f);
      }
    } else {
      return f();
    }
  };

  var flush = function() {
    while (waiterObs.length > 0) {
      flushWaiters(0);
    }
  };

  var flushWaiters = function(index) {
    var obs = waiterObs[index];
    var obsId = obs.id;
    var obsWaiters = waiters[obsId];
    waiterObs.splice(index, 1);
    delete waiters[obsId];
    if (waiterObs.length > 0) {
      flushDepsOf(obs);
    }
    for (var i = 0, f; i < obsWaiters.length; i++) {
      f = obsWaiters[i];
      f();
    }
  };

  var flushDepsOf = function(obs) {
    var deps = obs.internalDeps();
    for (var i = 0, dep; i < deps.length; i++) {
      dep = deps[i];
      if (waiters[dep.id]) {
        var index = _.indexOf(waiterObs, dep);
        flushWaiters(index);
      } else {
        flushDepsOf(dep);
      }
    }
  };

  var inTransaction = function(event, context, f, args) {
    if (rootEvent) {
      //console.log "in tx"
      return f.apply(context, args);
    } else {
      //console.log "start tx"
      rootEvent = event;
      try {
        var result = f.apply(context, args);
        //console.log("done with tx")
        flush();
      } finally {
        rootEvent = undefined;
        while (aftersIndex < afters.length) {
          var after = afters[aftersIndex];
          aftersIndex++;
          after();
        }
        aftersIndex = 0;
        afters = [];
      }
      return result;
    }
  };

  var currentEventId = function() {
    return rootEvent ? rootEvent.id : undefined
  };

  var wrappedSubscribe = function(obs, sink) {
    var unsubd = false;
    var shouldUnsub = false;
    var doUnsub = function() {
      shouldUnsub = true;
      return shouldUnsub;
    };
    var unsub = function() {
      unsubd = true;
      return doUnsub();
    };
    doUnsub = obs.dispatcher.subscribe(function(event) {
      return afterTransaction(function() {
        if (!unsubd) {
          var reply = sink(event);
          if (reply === Bacon.noMore) {
            return unsub();
          }
        }
      });
    });
    if (shouldUnsub) {
      doUnsub();
    }
    return unsub;
  };

  var hasWaiters = function() { return waiterObs.length > 0; };

  return { whenDoneWith, hasWaiters, inTransaction, currentEventId, wrappedSubscribe, afterTransaction };
}
)();
