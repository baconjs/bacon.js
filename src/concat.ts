import { EventStream, EventStreamOptions } from "./observable";
import { Desc } from "./describe";
import { nop } from "./helpers";
import Observable from "./observable";
import { EventSink } from "./types";
import _ from "./_";
import never from "./never";
import { argumentsToObservables } from "./argumentstoobservables";

export function concatE<V>(left: EventStream<V>, right: Observable<V>, options?: EventStreamOptions): EventStream<V> {
  return new EventStream(new Desc(left, "concat", [right]), function(sink: EventSink<V>) {
    var unsubRight = nop;
    var unsubLeft = left.dispatcher.subscribe(function(e) {
      if (e.isEnd) {
        unsubRight = right.toEventStream().dispatcher.subscribe(sink);
        return unsubRight;
      } else {
        return sink(e);
      }
    });
    return function() {
      return unsubLeft() , unsubRight();
    };
  }, undefined, options);
}

export function concatAll<V>(...streams_: (Observable<V> | Observable<V>[])[]): EventStream<V> {
  let streams = argumentsToObservables(streams_)
  if (streams.length) {
    return _.fold(_.tail(streams), _.head(streams).toEventStream(), (a, b) => a.concat(b))
      .withDesc(new Desc("Bacon", "concatAll", streams))
  } else {
    return never();
  }
}