import { EventStream, EventStreamOptions } from "./observable";
import { Desc } from "./describe";
import { nop } from "./helpers";
import Observable from "./observable";
import { EventSink } from "./types";
import { tail, head, fold } from "./_";
import never from "./never";
import { argumentsToObservables } from "./internal/argumentstoobservables";
import { more } from "./reply";

/** @hidden */
export function concatE<V>(left: EventStream<V>, right: Observable<V>, options?: EventStreamOptions): EventStream<V> {
  return new EventStream(new Desc(left, "concat", [right]), function(sink: EventSink<V>) {
    var unsubRight = nop;
    var unsubLeft = left.dispatcher.subscribe(function(e) {
      if (e.isEnd) {
        unsubRight = right.toEventStream().dispatcher.subscribe(sink);
        return more;
      } else {
        return sink(e);
      }
    });
    return function() {
      return unsubLeft() , unsubRight();
    };
  }, undefined, options);
}

/**
 Concatenates given array of EventStreams or Properties. Works by subcribing to the first source, and listeing to that
 until it ends. Then repeatedly subscribes to the next source, until all sources have ended.

 See [`concat`](#observable-concat)
 */
export function concatAll<V>(...streams_: (Observable<V> | Observable<V>[])[]): EventStream<V> {
  let streams = argumentsToObservables(streams_)
  return (streams.length
    ? fold(tail(streams), head(streams).toEventStream(), (a: EventStream<V>, b: Observable<V>) => a.concat(b))
    : never<V>()
  ).withDesc(new Desc("Bacon", "concatAll", streams))
}
