import "./property";
import EventStream, { Options } from "./eventstream";
import { Desc, withDesc } from "./describe";
import { nop } from "./helpers";
import Observable from "./observable";
import { EventSink } from "./types";
import Bacon from "./core"
import _ from "./_";
import never from "./never";
import { argumentsToObservables } from "./argumentstoobservables";

export function concatE<V>(left: EventStream<V>, right: Observable<V>, options?: Options): EventStream<V> {
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

export function concatAll<V>(...streams: (Observable<V> | Observable<V>[])[]): EventStream<V> {
  streams = argumentsToObservables(streams)
  if (streams.length) {
    return withDesc(
      new Desc(Bacon, "concatAll", streams),
      _.fold(_.tail(streams), _.head(streams).toEventStream(), (a, b) => a.concat(b))
    )
  } else {
    return never();
  }
}

Bacon.concatAll = concatAll