import UpdateBarrier from "./updatebarrier";
import { Event } from "../event";
import { Sink, Subscribe } from "../types"
import GlobalScheduler from "../scheduler"

/** @hidden */
export default function asyncWrapSubscribe<V>(obs, subscribe: Subscribe<V>): Subscribe<V> {
  //assertFunction(subscribe)
  var subscribing = false

  return function wrappedSubscribe(sink: Sink<V>) {
    //assertFunction(sink)
    const inTransaction = UpdateBarrier.isInTransaction()
    subscribing = true
    var asyncDeliveries: Event<V>[] | undefined
    function deliverAsync() { 
      //console.log("delivering async", obs, asyncDeliveries)
      var toDeliverNow: Event<V>[] = asyncDeliveries || []
      asyncDeliveries = undefined
      for (var i = 0; i < toDeliverNow.length; i++) {
        var event: Event<V> = toDeliverNow[i]
        sink(event)
      }
    }

    try {
      return subscribe(function wrappedSink(event: Event<V>) {
        if (subscribing || asyncDeliveries) {
          // Deliver async if currently subscribing
          // Also queue further events until async delivery has been completed
          
          //console.log("Stream responded synchronously", obs)
          if (!asyncDeliveries) {
            asyncDeliveries = [event]
            if (inTransaction) {
              UpdateBarrier.soonButNotYet(obs, deliverAsync)
            } else {
              GlobalScheduler.scheduler.setTimeout(deliverAsync, 0)
            }
          } else {
            asyncDeliveries.push(event)
          }
        } else {
          return sink(event)
        }
      })
    } finally {
      subscribing = false
    }
  }
}
