import CompositeUnsubscribe from "./compositeunsubscribe";
import {Desc} from "./describe";
import {endEvent, Event, hasValue} from "./event";
import {isObservable} from "./helpers";
import _ from "./_";
import Observable, {newEventStreamAllowSync, ObservableConstructor} from "./observable";
import propertyFromStreamSubscribe from "./internal/propertyfromstreamsubscribe";
import {more, noMore, Reply} from "./reply";
import once from "./once";
import {EventSink, Unsub} from "./types";

export type ValueSpawner<V, V2> = (value: V) => (Observable<V2> | EventOrValue<V2>)
export type SpawnerOrObservable<V, V2> = ValueSpawner<V, V2> | Observable<V2>
export interface EventSpawner<V, V2> {
  (e: Event<V>): Observable<V2> | EventOrValue<V2>
}

/** @hidden */
type EventOrValue<V> = Event<V> | V

/** @hidden */
export interface FlatMapParams {
  desc? : Desc
  mapError? : boolean
  firstOnly? : boolean
  limit? : number
}

/** @hidden */
export function flatMap_<In, Out>(spawner: EventSpawner<In, Out>, src: Observable<In>, params: FlatMapParams = {}): Observable<Out> {
  const root = src
  const rootDep = [root as Observable<any>]
  const childDeps: Observable<Out>[] = []
  const isProperty = (<any>src)._isProperty
  const ctor = (isProperty ? propertyFromStreamSubscribe : newEventStreamAllowSync) as ObservableConstructor
  let initialSpawned = false
  const desc = params.desc || new Desc(src, "flatMap_", [spawner])

  const result: Observable<Out> = ctor(desc, function(sink: EventSink<Out>) {
    const composite = new CompositeUnsubscribe()
    const queue: Event<In>[] = []
    function spawn(event: Event<In>) {
      if (isProperty && event.isInitial) {
        if (initialSpawned) {
          return more
        }
        initialSpawned = true
      }
      const child = makeObservable<Out>(spawner(event))
      childDeps.push(child)
      return composite.add(function(unsubAll: Unsub, unsubMe: Unsub) {
        return child.subscribeInternal(function(event: Event<Out>) {
          if (event.isEnd) {
            _.remove(child, childDeps)
            checkQueue()
            checkEnd(unsubMe)
            return noMore
          } else {
            event = event.toNext() // To support Property as the spawned stream
            const reply = sink(event)
            if (reply === noMore) { unsubAll() }
            return reply
          }
        })
      })
    }
    function checkQueue(): void {
      const event = queue.shift()
      if (event) { spawn(event) }
    }
    function checkEnd(unsub: Unsub): Reply {
      unsub()
      if (composite.empty()) { return sink(endEvent()) }
      return more
    }
    composite.add(function(__, unsubRoot: Unsub) { return root.subscribeInternal(function(event: Event<In>): Reply {
      if (event.isEnd) {
        return checkEnd(unsubRoot)
      } else if (event.isError && !params.mapError) {
        return sink(<any>event)
      } else if (params.firstOnly && composite.count() > 1) {
        return more
      } else {
        if (composite.unsubscribed) { return noMore }
        if (params.limit && composite.count() > params.limit) {
          queue.push(event)
        } else {
          spawn(event)
        }
        return more
      }
    })
    })
    return composite.unsubscribe
  })
  result.internalDeps = function() {
    if (childDeps.length) {
      return rootDep.concat(childDeps)
    } else {
      return rootDep
    }
  }
  return result
}

/** @hidden */
export function handleEventValueWith<In, Out>(f: SpawnerOrObservable<In, Out>): EventSpawner<In, Out> {
  if (typeof f == "function") {
    return ((event: Event<In>) => {
      if (hasValue(event)) {
        return f(event.value);
      }
      return <any>event
    })
  }
  return <any>((event: In) => <Observable<Out>>f)
}

/** @hidden */
export function makeObservable<V>(x: V | Observable<V> | Event<V>): Observable<V> {
  if (isObservable(x)) {
    return <any>x
  } else {
    return <any>once(x)
  }
}

export default flatMap_
