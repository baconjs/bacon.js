export default UpdateBarrier = (function() {

  var rootEvent,
    waiterObs = [],
    waiters = {},
    afters = [],
    aftersIndex = 0;

  return {
    afterTransaction: function(f) {
      if (rootEvent) {
        return afters.push(f);
      } else {
        return f();
      }
    },
    whenDoneWith: function(obs, f) {
      var obsWaiters;
      if (rootEvent) {
        obsWaiters = waiters[obs.id];
        if (!obsWaiters) {
          obsWaiters = waiters[obs.id] = [f];
          return waiterObs.push(obs);
        } else {
          return obsWaiters.push(f);
        }
      } else {
        return f();
      }
    },
    flush: function() {
      while (waiterObs.length > 0) {
        flushWaiters(0);
      }
    },
    flushWaiters: function(index) {
      var f, obs, obsId, obsWaiters, _i, _len;
      obs = waiterObs[index];
      obsId = obs.id;
      obsWaiters = waiters[obsId];
      waiterObs.splice(index, 1);
      delete waiters[obsId];
      flushDepsOf(obs);
      for (_i = 0, _len = obsWaiters.length; _i < _len; _i++) {
        f = obsWaiters[_i];
        f();
      }
    },
    flushDepsOf: function(obs) {
      var dep, deps, index, _i, _len;
      deps = obs.internalDeps();
      for (_i = 0, _len = deps.length; _i < _len; _i++) {
        dep = deps[_i];
        flushDepsOf(dep);
        if (waiters[dep.id]) {
          index = _.indexOf(waiterObs, dep);
          flushWaiters(index);
        }
      }
    },
    inTransaction: function(event, context, f, args) {
      var after, result;
      if (rootEvent) {
        return f.apply(context, args);
      } else {
        rootEvent = event;
        try {
          result = f.apply(context, args);
          flush();
        } finally {
          rootEvent = undefined;
          while (aftersIndex < afters.length) {
            after = afters[aftersIndex];
            aftersIndex++;
            after();
          }
          aftersIndex = 0;
          afters = [];
        }
        return result;
      }
    },
    currentEventId: function() {
      if (rootEvent) {
        return rootEvent.id;
      }
    },
    wrappedSubscribe: function(obs, sink) {
      var doUnsub, unsub, unsubd;
      unsubd = false;
      doUnsub = function() {};
      unsub = function() {
        unsubd = true;
        return doUnsub();
      };
      doUnsub = obs.dispatcher.subscribe(function(event) {
        return afterTransaction(function() {
          var reply;
          if (!unsubd) {
            reply = sink(event);
            if (reply === Bacon.noMore) {
              return unsub();
            }
          }
        });
      });
      return unsub;
    },
    hasWaiters: function() {
      return waiterObs.length > 0;
    }
  };
}());