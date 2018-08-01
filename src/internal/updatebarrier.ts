import _ from '../_';
import { Reply, more, noMore } from '../reply';
import { assertFunction } from "./assert";
import { Event } from "../event"
import { Subscribe } from "../types"
import GlobalScheduler from "../scheduler";

interface Observable {
  id: number
  internalDeps(): Observable[]
}

type Call = () => any
type Afters = [Observable, Call]
type Sink<V> = (V) => any
type EventSink<V> = Sink<Event<V>>

var rootEvent: Event<any> | undefined = undefined;
var waiterObs: Observable[] = [];
var waiters = {};
var aftersStack: [Afters[], number][] = []
var aftersStackHeight = 0
var flushed = {}
var processingAfters = false

function toString() {
  return _.toString({rootEvent, processingAfters, waiterObs, waiters, aftersStack, aftersStackHeight, flushed})
}

function ensureStackHeight(h) {
  if (h <= aftersStackHeight) return
  if (!aftersStack[h-1]) {
    aftersStack[h-1]=[[],0]
  }
  aftersStackHeight = h
}

function isInTransaction() {
  return rootEvent !== undefined
}

function soonButNotYet(obs, f) {
  if (rootEvent) {
    // If in transaction -> perform within transaction
    //console.log('in tx')
    whenDoneWith(obs, f)
  } else {
    // Otherwise -> perform with timeout
    //console.log('with timeout')
    
    GlobalScheduler.scheduler.setTimeout(f, 0)
  }
}

function afterTransaction(obs: Observable, f: Call): void {
  if (rootEvent || processingAfters) {
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
}

function containsObs(obs: Observable, aftersList: Afters[]) {
  for (var i = 0; i < aftersList.length; i++) {
    if (aftersList[i][0].id == obs.id) return true
  }
  return false
}

function processAfters() {
  let stackSizeAtStart = aftersStackHeight
  if (!stackSizeAtStart) return
  let isRoot = !processingAfters
  processingAfters = true
  try {
    while (aftersStackHeight >= stackSizeAtStart) { // to prevent sinking to levels started by others
      var topOfStack = aftersStack[aftersStackHeight - 1]
      if (!topOfStack) throw new Error("Unexpected stack top: " + topOfStack)
      var [topAfters, index] = topOfStack
      if (index < topAfters.length) {
        var [, after] = topAfters[index];
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
  } finally {
    if (isRoot) processingAfters = false
  }
}


function whenDoneWith(obs: Observable, f: Call) {
  if (rootEvent) {
    var obsWaiters = waiters[obs.id];
    if (obsWaiters === undefined) {
      obsWaiters = waiters[obs.id] = [f];
      return waiterObs.push(obs);
    } else {
      return obsWaiters.push(f);
    }
  } else {
    return f();
  }
}

function flush() {
  while (waiterObs.length > 0) {
    flushWaiters(0, true);
  }
  flushed = {}
}

function flushWaiters(index: number, deps: boolean) {
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
}

function flushDepsOf(obs: Observable) {
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
}

function inTransaction(event: Event<any> | undefined, context: any, f: Function, args: any[]) {
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
}

function currentEventId() {
  return rootEvent ? rootEvent.id : undefined
}

function wrappedSubscribe<V>(obs: Observable, subscribe: Subscribe<V>, sink: EventSink<V>) {
  assertFunction(sink);
  let unsubd = false;
  let shouldUnsub = false;
  let doUnsub = () => {
    shouldUnsub = true
  }
  let unsub = () => {
    unsubd = true
    doUnsub()
  }
  doUnsub = subscribe(function(event: Event<V>): Reply {
    afterTransaction(obs, function() {
      if (!unsubd) {
        var reply = sink(event);
        if (reply === noMore) {
          unsub();
        }
      }
    })
    return more
  })
  if (shouldUnsub) {
    doUnsub();
  }
  return unsub;
}

function hasWaiters() { return waiterObs.length > 0; }


export default { toString, whenDoneWith, hasWaiters, inTransaction, currentEventId, wrappedSubscribe, afterTransaction, soonButNotYet, isInTransaction };
