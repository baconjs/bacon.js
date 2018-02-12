import Observable from "./observable";
import UpdateBarrier from "./updatebarrier";
import { Desc } from "./describe";
import { inherit, extend, nop } from "./helpers";
import { registerObs } from "./spy";
import { more, noMore } from "./reply";
import { None, Some, toOption } from "./optional";
import Property from "./property";
import _ from "./_";
import { Initial } from "./event";
import Dispatcher from "./dispatcher";
import describe from "./describe";
import Bacon from "./core";

// allowSync option is used for overriding the "force async" behaviour or EventStreams.
// ideally, this should not exist, but right now the implementation of some operations
// relies on using internal EventStreams that have synchrnous behavior. These are not exposed
// to the outside world, though.
export const allowSync = { forceAsync: false }
const defaultDesc = describe("Bacon", "new EventStream", [])
export default function EventStream(desc, subscribe, handler, options) {
  if (!(this instanceof EventStream)) {
    return new EventStream(desc, subscribe, handler);
  }
  if (_.isFunction(desc)) {
    handler = subscribe;
    subscribe = desc;
    desc = defaultDesc;
  }
  if (options !== allowSync) { 
    subscribe = asyncWrapSubscribe(this, subscribe)
  }
  Observable.call(this, desc);
  //assertFunction(subscribe);
  this.dispatcher = new Dispatcher(subscribe, handler);
  registerObs(this);
}

function asyncWrapSubscribe(obs, subscribe) {
  //assertFunction(subscribe)
  var subscribing = false

  return function wrappedSubscribe(sink) {
    //assertFunction(sink)
    const inTransaction = UpdateBarrier.isInTransaction()
    subscribing = true
    var asyncDeliveries
    function deliverAsync() { 
      //console.log("delivering async", obs, asyncDeliveries)
      var toDeliverNow = asyncDeliveries
      asyncDeliveries = null
      for (var i = 0; i < toDeliverNow.length; i++) {
        var event = toDeliverNow[i]
        sink(event)
      }
    }

    try {
      return subscribe(function wrappedSink(event) {
        if (subscribing || asyncDeliveries) {
          // Deliver async if currently subscribing
          // Also queue further events until async delivery has been completed
          
          //console.log("Stream responded synchronously", obs)
          if (!asyncDeliveries) {
            asyncDeliveries = [event]
            if (inTransaction) {
              UpdateBarrier.soonButNotYet(obs, deliverAsync)
            } else {
              Bacon.scheduler.setTimeout(deliverAsync, 0)
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

function streamSubscribeToPropertySubscribe(initValue, streamSubscribe) {
  //assertFunction(streamSubscribe)
  return function(sink) {
    var initSent = false;
    var subbed = false;
    var unsub = nop;
    var reply = more;
    var sendInit = function() {
      if (!initSent) {
        return initValue.forEach(function(value) {
          initSent = true;
          reply = sink(new Initial(value));
          if (reply === noMore) {
            unsub();
            unsub = nop;
            return nop;
          }
        });
      }
    };

    unsub = streamSubscribe(function(event) {
      if (event.hasValue) {
        if (event.isInitial && !subbed) {
          initValue = new Some(event.value);
          return more;
        } else {
          if (!event.isInitial) { sendInit(); }
          initSent = true;
          initValue = new Some(event.value);
          return sink(event);
        }
      } else {
        if (event.isEnd) {
          reply = sendInit();
        }
        if (reply !== noMore) { return sink(event); }
      }
    });
    subbed = true;
    sendInit();
    return unsub;
  }
}

inherit(EventStream, Observable);
extend(EventStream.prototype, {
  _isEventStream: true,

  toProperty(initValue_) {
    var initValue = arguments.length === 0 ? None : toOption(initValue_);
    var disp = this.dispatcher;
    var desc = new Desc(this, "toProperty", [initValue_]);
    let streamSubscribe = sink => disp.subscribe(sink)
    return new Property(desc, streamSubscribeToPropertySubscribe(initValue, streamSubscribe));
  },

  toEventStream() { return this; },

  withHandler(handler) {
    return new EventStream(new Desc(this, "withHandler", [handler]), this.dispatcher.subscribe, handler, allowSync);
  }
});

export { EventStream, streamSubscribeToPropertySubscribe };
