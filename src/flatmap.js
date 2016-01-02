import CompositeUnsubscribe from "./compositeunsubscribe";
import { Desc } from "./describe";
import { endEvent } from "./event";
import { isObservable } from "./helpers";
import _ from "./_";
import { makeFunctionArgs } from "./functionconstruction";
import Observable from "./observable";
import EventStream from "./eventstream";
import { noMore, more } from "./reply";
import once from "./once";

Observable.prototype.flatMap = function() {
  return flatMap_(this, makeSpawner(arguments));
};

Observable.prototype.flatMapFirst = function() {
  return flatMap_(this, makeSpawner(arguments), true);
};

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

export function flatMap_(root, f, firstOnly, limit) {
  var rootDep = [root];
  var childDeps = [];
  var desc = new Desc(root, "flatMap" + (firstOnly ? "First" : ""), [f]);
  var result = new EventStream(desc, function(sink) {
    var composite = new CompositeUnsubscribe();
    var queue = [];
    var spawn = function(event) {
      var child = makeObservable(f(event.value()));
      childDeps.push(child);
      return composite.add(function(unsubAll, unsubMe) {
        return child.dispatcher.subscribe(function(event) {
          if (event.isEnd()) {
            _.remove(child, childDeps);
            checkQueue();
            checkEnd(unsubMe);
            return noMore;
          } else {
            if ((typeof event !== "undefined" && event !== null) ? event._isInitial : undefined) {
              // To support Property as the spawned stream
              event = event.toNext();
            }
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
      if (event.isEnd()) {
        return checkEnd(unsubRoot);
      } else if (event.isError()) {
        return sink(event);
      } else if (firstOnly && composite.count() > 1) {
        return more;
      } else {
        if (composite.unsubscribed) { return noMore; }
        if (limit && composite.count() > limit) {
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
}
