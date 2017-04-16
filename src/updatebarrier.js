// build-dependencies: _

var UpdateBarrier = Bacon.UpdateBarrier = (function() {
  var rootEvent;
  var waiterObs = [];
  var waiters = {};
  var aftersStack = []
  var aftersStackHeight = 0
  var flushed = {}

  function ensureStackHeight(h) {
    if (h <= aftersStackHeight) return
    if (!aftersStack[h-1]) {
      aftersStack[h-1]=[[],0]
    }
    aftersStackHeight = h
  }

  var afterTransaction = function(obs, f) {
    if (rootEvent || aftersStack.length) {
      ensureStackHeight(1)
      var stackIndexForThisObs = 0
      while (stackIndexForThisObs < aftersStackHeight - 1) {
        if (containsObs(obs, aftersStack[stackIndexForThisObs][0])) {
          // this observable is already being processed at this stack index -> use this index
          break;
        }
        stackIndexForThisObs++
      }
      var listFromStack = aftersStack[stackIndexForThisObs][0]
      listFromStack.push([obs, f]);
      if (!rootEvent) {
        processAfters() // wouldn't be called otherwise
      }
    } else {
      return f();
    }
  };

  function containsObs(obs, aftersList) {
    for (var i in aftersList) {
      if (aftersList[i][0].id == obs.id) return true
    }
    return false
  }

  function processAfters() {
    let stackSizeAtStart = aftersStackHeight
    if (!stackSizeAtStart) return
    while (aftersStackHeight >= stackSizeAtStart) { // to prevent sinking to levels started by others
      var topOfStack = aftersStack[aftersStackHeight - 1]
      if (!topOfStack) throw new Error("Unexpected stack top: " + topOfStack)
      var [topAfters, index] = topOfStack
      if (index < topAfters.length) {
        var [obs, after] = topAfters[index];
        topOfStack[1]++ // increase index already here to indicate that this level is being processed
        ensureStackHeight(aftersStackHeight+1) // to ensure there's a new level for recursively added afters
        var callSuccess = false
        try {
          after()
          callSuccess = true
          while (aftersStackHeight > stackSizeAtStart && aftersStack[aftersStackHeight-1][0].length == 0) {
            aftersStackHeight--
          }
        } finally {
          if (!callSuccess) {
            aftersStack = []
            aftersStackHeight = 0 // reset state to prevent stale updates after error
          }
        }
      } else {
        topOfStack[0] = []
        topOfStack[1] = 0 // reset this level
        break
      }
    }
  }

  
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
      flushWaiters(0, true);
    }
    flushed = {}
  };

  var flushWaiters = function(index, deps) {
    var obs = waiterObs[index];
    var obsId = obs.id;
    var obsWaiters = waiters[obsId];
    waiterObs.splice(index, 1);
    delete waiters[obsId];
    if (deps && waiterObs.length > 0) {
      flushDepsOf(obs);
    }
    for (var i = 0, f; i < obsWaiters.length; i++) {
      f = obsWaiters[i];
      f();
    }
  };

  var flushDepsOf = function(obs) {
    if (flushed[obs.id]) return
    var deps = obs.internalDeps();
    for (var i = 0, dep; i < deps.length; i++) {
      dep = deps[i];
      flushDepsOf(dep);
      if (waiters[dep.id]) {
        var index = _.indexOf(waiterObs, dep);
        flushWaiters(index, false);
      }
    }
    flushed[obs.id] = true
  };

  var inTransaction = function(event, context, f, args) {
    if (rootEvent) {
      //console.log("in tx")
      return f.apply(context, args);
    } else {
      //console.log("start tx")
      rootEvent = event;
      try {
        var result = f.apply(context, args);
        //console.log("done with tx")
        flush();
      } finally {
        rootEvent = undefined;
        processAfters()
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
      return afterTransaction(obs, function() {
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
