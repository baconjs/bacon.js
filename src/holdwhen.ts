import { EventStream, default as Observable, Property } from "./observable";
import { Event, endEvent, nextEvent, hasValue } from "./event";
import CompositeUnsubscribe from "./compositeunsubscribe";
import { Desc } from "./describe";
import { EventSink, Unsub } from "./types";
import { Reply, more, noMore } from "./reply";

/** @hidden */
export function holdWhen<V>(src: Observable<V>, valve: Property<boolean>): EventStream<V> {
  var onHold = false
  var bufferedValues: V[] = []
  var srcIsEnded = false
  return new EventStream(new Desc(src, "holdWhen", [valve]), function(sink: EventSink<V>) {
    var composite = new CompositeUnsubscribe()
    var subscribed = false
    var endIfBothEnded = function(unsub?: Unsub): Reply {
      if (unsub) { unsub() }
      if (composite.empty() && subscribed) {
        return sink(endEvent())
      }
      return more
    }
    composite.add(function(unsubAll: Unsub, unsubMe: Unsub) {
      return valve.subscribeInternal(function(event: Event<boolean>): Reply {
        if (hasValue(event)) {
          onHold = event.value
          var result = more
          if (!onHold) {
            var toSend = bufferedValues
            bufferedValues = []
            for (var i = 0; i < toSend.length; i++) {
              result = sink(nextEvent(toSend[i]))
            }
            if(srcIsEnded){
              sink(endEvent())
              unsubMe()
              result = noMore
            }
          }
          return result
        } else if (event.isEnd) {
          return endIfBothEnded(unsubMe)
        } else {
          return sink(event)
        }
      })
    })
    composite.add(function(unsubAll: Unsub, unsubMe: Unsub) {
      return src.subscribeInternal(function(event: Event<V>): Reply {
        if (onHold && hasValue(event)) {
          bufferedValues.push(event.value)
          return more
        } else if (event.isEnd && bufferedValues.length) {
          srcIsEnded = true
          return endIfBothEnded(unsubMe)
        } else {
          return sink(event)
        }
      })
    })
    subscribed = true
    endIfBothEnded()
    return composite.unsubscribe
  });
}