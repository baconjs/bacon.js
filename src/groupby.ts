import "./concat";
import { filterT } from "./filter";
import { mapT } from "./map";
import once from "./once";
import Observable, { EventStream } from "./observable";
import _ from "./_";
import { Event } from "./event"
import { EventSink } from "./types";
import { composeT } from "./transform";

export interface GroupLimiter<V> {
  (data: EventStream<V>, firstValue: V): EventStream<V>
}

/** @hidden */
interface StreamMap<V> {
  [key: string]: EventStream<V>
}

/** @hidden */
export function groupBy<V>(src: Observable<V>, keyF: (T) => string, limitF: GroupLimiter<V> = _.id): Observable<Observable<V>> {
  var streams: StreamMap<V> = {};
  return src.transform(composeT(
    filterT((x: V) => !streams[keyF(x)]),
    mapT(function(firstValue: V) {
      var key: string = keyF(firstValue)
      var similarValues: Observable<V> = src.filter(x => keyF(x) === key )
      var data: EventStream<V> = once(firstValue).concat(similarValues)
      var limited = limitF(data, firstValue).transform((event: Event<V>, sink: EventSink<V>) => {
        sink(event)
        if (event.isEnd) {
          delete streams[key];
        }
      })
      streams[key] = limited;
      return limited;
    })
  ))
}