import { EventStream, default as Observable, Property } from "./observable";
import { Event, endEvent, nextEvent, hasValue } from "./event";
import CompositeUnsubscribe from "./compositeunsubscribe";
import { Desc } from "./describe";
import { EventSink, Unsub } from "./types";
import { more, noMore } from "./reply";

export function holdWhen<V>(src: Observable<V>, valve: Property<boolean>): EventStream<V> {
  var onHold = false
  var bufferedValues: V[] = []
  var srcIsEnded = false
  return new EventStream(new Desc(src, "holdWhen", [valve]), function(sink: EventSink<V>) {
    var composite = new CompositeUnsubscribe()
    var subscribed = false
    var endIfBothEnded = function(unsub?: Unsub) {
      if (unsub) { unsub() }
      if (composite.empty() && subscribed) {
        return sink(endEvent())
      }
    }
    composite.add(function(unsubAll: Unsub, unsubMe: Unsub) {
      return valve.subscribeInternal(function(event: Event<boolean>) {
        if (hasValue(event)) {
          onHold = event.value
          if (!onHold) {
            var toSend = bufferedValues
            bufferedValues = []
            var result = more
            for (var i = 0; i < toSend.length; i++) {
              result = sink(nextEvent(toSend[i]))
            }
            if(srcIsEnded){
              sink(endEvent())
              unsubMe()
              result = noMore
            }
            return result
          }
        } else if (event.isEnd) {
          return endIfBothEnded(unsubMe)
        } else {
          return sink(event)
        }
      })
    })
    composite.add(function(unsubAll: Unsub, unsubMe: Unsub) {
      return src.subscribeInternal(function(event: Event<V>) {
        if (onHold && hasValue(event)) {
          return bufferedValues.push(event.value)
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