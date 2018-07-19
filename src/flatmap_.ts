import CompositeUnsubscribe from "./compositeunsubscribe"
import { Desc } from "./describe"
import { endEvent, Event } from "./event"
import { isObservable } from "./helpers"
import _ from "./_"
import Observable, { ObservableConstructor } from "./observable"
import propertyFromStreamSubscribe from "./propertyfromstreamsubscribe"
import { more, noMore, Reply } from "./reply"
import once from "./once"
import { newEventStream } from "./observable"
import { EventSink, Unsub } from "./types"

export type Spawner<V, V2> = ((V) => (V2 | Observable<V2>)) | Observable<V2>

export interface FlatMapParams {
  desc? : Desc
  mapError? : boolean
  firstOnly? : boolean
  limit? : number
}

export function flatMap_<In, Out>(f: (In) => Out | Observable<Out>, src: Observable<In>, params: FlatMapParams = {}): Observable<Out> {
  f = _.toFunction(f)
  const root = src
  const rootDep = [root as Observable<any>]
  const childDeps: Observable<Out>[] = []
  const isProperty = (<any>src)._isProperty
  const ctor = (isProperty ? propertyFromStreamSubscribe : newEventStream) as ObservableConstructor
  let initialSpawned = false
  const desc = params.desc || new Desc(src, "flatMap_", [f])

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
      const child = makeObservable<Out>(f(event))
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
    composite.add(function(__, unsubRoot: Unsub) { return root.subscribeInternal(function(event: Event<In>) {
      if (event.isEnd) {
        return checkEnd(unsubRoot)
      } else if (event.isError && !params.mapError) {
        return sink(event)
      } else if (params.firstOnly && composite.count() > 1) {
        return more
      } else {
        if (composite.unsubscribed) { return noMore }
        if (params.limit && composite.count() > params.limit) {
          return queue.push(event)
        } else {
          return spawn(event)
        }
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

export function handleEventValueWith<In, Out>(f: ((In) => Out) | Out): ((In) => Out) {
  if (typeof f == "function") {
    return <any>(event => f(event.value))
  }
  return <any>(event => <Out>f)
}

export function makeObservable<V>(x: V | Observable<V>): Observable<V> {
  if (isObservable(x)) {
    return <any>x
  } else {
    return <any>once(x)
  }
}

export default flatMap_