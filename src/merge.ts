import { EventStream } from "./observable";
import CompositeUnsubscribe from "./compositeunsubscribe";
import { argumentsToObservables } from "./internal/argumentstoobservables";
import never from "./never";
import { map } from "./_";
import { more, noMore } from "./reply";
import { endEvent, Event } from "./event";
import { Desc } from "./describe";
import Observable from "./observable";
import { Unsub } from "./types";

/**
 Merges given array of EventStreams or Properties, by collecting the values from all of the sources into a single
 EventStream.

 See also [`merge`](classes/eventstream.html#merge).
 */
export function mergeAll<V>(...streams: (Observable<V> | Observable<V>[])[]): EventStream<V> {
  let flattenedStreams = argumentsToObservables(streams);
  if (flattenedStreams.length) {
    return new EventStream(new Desc("Bacon", "mergeAll", flattenedStreams), function(sink) {
      var ends = 0
      var smartSink = function(obs: Observable<V>) {
        return function(unsubBoth: Unsub) {
          return obs.subscribeInternal(function(event: Event<V>) {
            if (event.isEnd) {
              ends++
              if (ends === flattenedStreams.length) {
                return sink(endEvent())
              } else {
                return more
              }

            } else {
              event = event.toNext()
              var reply = sink(event)
              if (reply === noMore) { unsubBoth() }
              return reply
            }
          })
        }
      }
      var sinks = map(smartSink, flattenedStreams);
      return new CompositeUnsubscribe(sinks).unsubscribe;
    })
  } else {
    return never()
  }
}
