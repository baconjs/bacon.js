import "./scheduler";
import Bacon from "./core";
import Observable from "./observable";
import { Desc, withDesc } from "./describe";

const defaultOptions = { trailing: true }

Observable.prototype.throttle = function (delay, options = defaultOptions ) {
  var { leading, trailing } = options
  var lastCallTime = 0
  var trailingValue, timeoutId, trailingEnd
  const cancelTrailing = () => {
    if (timeoutId !== null) {
      Bacon.scheduler.clearTimeout(timeoutId)
      timeoutId = null
    }  
  }
  let stream
  const trailingCall = () => {
    //console.log("delayed push", trailingValue, trailingEnd)
    stream.dispatcher.push(trailingValue)
    timeoutId = null
    trailingValue = null
    lastCallTime = Bacon.scheduler.now()
    if (trailingEnd) {
      stream.dispatcher.push(trailingEnd)
    }  
  }
  return stream = withDesc(
    new Desc(this, "throttle", options === defaultOptions ? [delay] : [delay, options]),
    this.withHandler(function (event) { 
      if (event.isNext) {
        let curTime = Bacon.scheduler.now()
        if (lastCallTime === 0 && !leading) {
          lastCallTime = curTime
        }
        let remaining = delay - (curTime - lastCallTime)
        if (remaining <= 0) {
          cancelTrailing()
          lastCallTime = curTime
          return this.push(event)
        } else if (trailing) {
          //console.log('scheduling', event, 'in', remaining)
          trailingValue = event
          cancelTrailing()
          timeoutId = Bacon.scheduler.setTimeout(trailingCall, remaining)
        }
      } else if (event.isEnd && timeoutId !== null) {
        trailingEnd = event
      } else {
        //console.log('immediate', event)
        return this.push(event)
      }
    })
  )
};
