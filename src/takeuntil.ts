import Property from "./property";
import "./mapend";
import "./skiperrors";
import { endEvent, Event, hasValue, nextEvent } from "./event";
import { more } from "./reply";
import { Desc, withDesc } from "./describe";
import { groupSimultaneous_ } from "./groupsimultaneous";
import { allowSync } from "./eventstream";
import Observable from "./observable";
import { EventSink } from "./types";

const endMarker = {};

type OrEndMarker<V> = V | {}

export default function takeUntil<V>(src: Observable<V>, stopper): Observable<V> {
  let endMapped: Observable<OrEndMarker<V>> = (<Observable<OrEndMarker<V>>>src).mapEnd(endMarker);
  let withEndMarker: Observable<OrEndMarker<V>[][]> = groupSimultaneous_([endMapped, stopper.skipErrors()], allowSync)
  if (src instanceof Property) withEndMarker = withEndMarker.toProperty()
  let impl = withEndMarker.transform(function(event: Event<OrEndMarker<V>[][]>, sink: EventSink<V>) {
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
    }
  )
  return withDesc(new Desc(src, "takeUntil", [stopper]), impl);
}