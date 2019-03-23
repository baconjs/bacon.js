import "./concat";
import { filterT } from "./filter";
import { mapT } from "./map";
import once from "./once";
import Observable, { EventStream } from "./observable";
import _ from "./_";
import { Event } from "./event"
import { EventSink } from "./types";
import { composeT } from "./transform";

export type GroupTransformer<V, V2> = (data: EventStream<V>, firstValue: V) => Observable<V2>

/** @hidden */
interface StreamMap<V> {
  [key: string]: EventStream<V>
}

/** @hidden */
export function groupBy<V, V2>(src: Observable<V>, keyF: (value: V) => string, limitF: GroupTransformer<V, V2> = <any>_.id): Observable<EventStream<V2>> {
  var streams: StreamMap<V2> = {};
  return src.transform(composeT(
    filterT((x: V) => !streams[keyF(x)]),
    mapT(function(firstValue: V) {
      var key: string = keyF(firstValue)
      var similarValues: Observable<V> = src.changes().filter(x => keyF(x) === key )
      var data: EventStream<V> = once(firstValue).concat(similarValues)
      var limited = limitF(data, firstValue).toEventStream().transform((event: Event<V2>, sink: EventSink<V2>) => {
        let reply = sink(event)
        if (event.isEnd) {
          delete streams[key];
        }
        return reply
      })
      streams[key] = limited;
      return limited;
    })
  ))
}
