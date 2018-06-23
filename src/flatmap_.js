import CompositeUnsubscribe from "./compositeunsubscribe";
import { Desc } from "./describe";
import { endEvent } from "./event";
import { isObservable } from "./helpers";
import _ from "./_";
import { makeFunctionArgs } from "./functionconstruction";
import Observable from "./observable";
import EventStream from "./eventstream";
import propertyFromStreamSubscribe from "./propertyfromstreamsubscribe";
import { noMore, more } from "./reply";
import once from "./once";

function newEventStream(...args) {
  return new EventStream(...args)
}

Observable.prototype.flatMap_ = function(f, params = { }) {
    const root = this
    const rootDep = [root];
    const childDeps = [];
    const isProperty = this._isProperty
    const ctor = isProperty
      ? propertyFromStreamSubscribe
      : newEventStream
    let initialSpawned = false
    
    var result = ctor(params.desc || new Desc(this, "flatMap_", arguments), function(sink) {
      var composite = new CompositeUnsubscribe();
      var queue = [];
      var spawn = function(event) {
        if (isProperty && event.isInitial) {
          if (initialSpawned) {
            return more;
          }
          initialSpawned = true
        }
        var child = makeObservable(f(event));
        childDeps.push(child);
        return composite.add(function(unsubAll, unsubMe) {
          return child.dispatcher.subscribe(function(event) {
            if (event.isEnd) {
              _.remove(child, childDeps);
              checkQueue();
              checkEnd(unsubMe);
              return noMore;
            } else {
              event = event.toNext(); // To support Property as the spawned stream
              var reply = sink(event);
              if (reply === noMore) { unsubAll(); }
              return reply;
            }
          });
        });
      };
      var checkQueue = function() {
        var event = queue.shift();
        if (event) { return spawn(event); }
      };
      var checkEnd = function(unsub) {
        unsub();
        if (composite.empty()) { return sink(endEvent()); }
      };
      composite.add(function(__, unsubRoot) { return root.dispatcher.subscribe(function(event) {
        if (event.isEnd) {
          return checkEnd(unsubRoot);
        } else if (event.isError && !params.mapError) {
          return sink(event);
        } else if (params.firstOnly && composite.count() > 1) {
          return more;
        } else {
          if (composite.unsubscribed) { return noMore; }
          if (params.limit && composite.count() > params.limit) {
            return queue.push(event);
          } else {
            return spawn(event);
          }
        }
      });
      });
      return composite.unsubscribe;
    });
    result.internalDeps = function() {
      if (childDeps.length) {
        return rootDep.concat(childDeps);
      } else {
        return rootDep;
      }
    };
    return result;
  };
  
export const handleEventValueWith = f => event => f(event.value)

export function makeSpawner(args) {
  if (args.length === 1 && isObservable(args[0])) {
    return _.always(args[0]);
  } else {
    return makeFunctionArgs(args);
  }
}

export function makeObservable(x) {
  if (isObservable(x)) {
    return x;
  } else {
    return once(x);
  }
}
