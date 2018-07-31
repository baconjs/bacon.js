import Observable, { allowSync, Property } from "./observable";
import "./mapend";
import "./skiperrors";
import { endEvent, Event, hasValue, nextEvent } from "./event";
import { more } from "./reply";
import { Desc } from "./describe";
import { groupSimultaneous_ } from "./groupsimultaneous";
import { EventSink } from "./types";

/** @hidden */
const endMarker = {};
/** @hidden */
type OrEndMarker<V> = V | {}

/** @hidden */
export default function takeUntil<V>(src: Observable<V>, stopper: Observable<any>): Observable<V> {
  let endMapped: Observable<OrEndMarker<V>> = (<Observable<OrEndMarker<V>>>src).mapEnd(endMarker);
  let withEndMarker: Observable<OrEndMarker<V>[][]> = groupSimultaneous_([endMapped, stopper.skipErrors()], allowSync)
  if (src instanceof Property) withEndMarker = withEndMarker.toProperty()
  return withEndMarker.transform(function(event: Event<OrEndMarker<V>[][]>, sink: EventSink<V>) {
      if (hasValue(event)) {
        var [data, stopper]: OrEndMarker<V>[][] = event.value;
        if (stopper.length) {
          return sink(endEvent());
        } else {
          var reply = more;
          for (var i = 0; i < data.length; i++) {
            let value: OrEndMarker<V> = data[i];
            if (value === endMarker) {
              return sink(endEvent());
            } else {
              reply = sink(nextEvent(value));
            }
          }
          return reply;
        }
      } else {
        return sink(event);
      }
    }, new Desc(src, "takeUntil", [stopper])
  )
}