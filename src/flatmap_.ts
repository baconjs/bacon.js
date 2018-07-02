import CompositeUnsubscribe from "./compositeunsubscribe";
import { Desc } from "./describe";
import { endEvent, Event } from "./event";
import { isObservable } from "./helpers";
import _ from "./_";
import Observable, { ObservableConstructor } from "./observable";
import propertyFromStreamSubscribe from "./propertyfromstreamsubscribe";
import { more, noMore } from "./reply";
import once from "./once";
import { newEventStream } from "./eventstream";
import { EventSink } from "./types";

export interface FlatMapParams {
  desc? : Desc
  mapError? : boolean
  firstOnly? : boolean
  limit? : number
}

export function flatMap_<In, Out>(f: (In) => Observable<Out>, src: Observable<In>, params: FlatMapParams = {}): Observable<Out> {
  f = _.toFunction(f)
  const root = src
  const rootDep = [root as Observable<any>];
  const childDeps: Observable<Out>[] = [];
  const isProperty = (<any>src)._isProperty
  const ctor = (isProperty ? propertyFromStreamSubscribe : newEventStream) as ObservableConstructor
  let initialSpawned = false
  let desc = params.desc || new Desc(src, "flatMap_", [f])

  var result: Observable<Out> = ctor(desc, function(sink: EventSink<Out>) {
    var composite = new CompositeUnsubscribe();
    var queue: Event<In>[] = [];
    var spawn = function(event: Event<In>) {
      if (isProperty && event.isInitial) {
        if (initialSpawned) {
          return more;
        }
        initialSpawned = true
      }
      var child = makeObservable<Out>(f(event));
      childDeps.push(child);
      return composite.add(function(unsubAll, unsubMe) {
        return child.subscribeInternal(function(event) {
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
    composite.add(function(__, unsubRoot) { return root.subscribeInternal(function(event) {
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
}

export function handleEventValueWith<In, Out>(f: ((V) => Out) | Out): Out {
  if (typeof f == "function") {
    return <any>(event => f(event.value))
  }
  return <any>(event => <Out>f)
}

export function makeObservable<V>(x: V | Observable<V>): Observable<V> {
  if (isObservable(x)) {
    return <any>x;
  } else {
    return <any>once(x);
  }
}

export default flatMap_