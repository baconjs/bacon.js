import "./concat";
import "./filter";
import "./map";
import once from "./once";
import Observable, { EventStream } from "./observable";
import _ from "./_";
import { Event } from "./event"
import { EventSink } from "./types";

export type GroupKey = string

export interface GroupLimiter<V> {
  (data: EventStream<V>, firstValue: V): EventStream<V>
}

interface StreamMap<V> {
  [key: string]: EventStream<V>
}

export function groupBy<V>(src: Observable<V>, keyF: (T) => GroupKey, limitF: GroupLimiter<V> = _.id): Observable<Observable<V>> {
  var streams: StreamMap<V> = {};
  return src
    .filter(function(x: V) { return !streams[keyF(x)]; })
    .map(function(firstValue: V) {
      var key: GroupKey = keyF(firstValue)
      var similarValues: Observable<V> = src.filter(function(x) { return keyF(x) === key })
      var data: EventStream<V> = once(firstValue).concat(similarValues)
      var limited = limitF(data, firstValue).transform(function(event: Event<V>, sink: EventSink<V>) {
        sink(event)
        if (event.isEnd) {
          delete streams[key];
        }
      })
      streams[key] = limited;
      return limited;
    })
}