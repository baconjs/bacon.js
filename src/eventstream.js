import Observable from "./observable";
import { Desc } from "./describe";
import { inherit, extend, nop, assertFunction } from "./helpers";
import { registerObs } from "./spy";
import { more, noMore } from "./reply";
import { None, Some, toOption } from "./optional";
import Property from "./property";
import _ from "./_";
import { Initial } from "./event";
import Dispatcher from "./dispatcher";

export default function EventStream(desc, subscribe, handler) {
  if (!(this instanceof EventStream)) {
    return new EventStream(desc, subscribe, handler);
  }
  if (_.isFunction(desc)) {
    handler = subscribe;
    subscribe = desc;
    desc = Desc.empty;
  }
  subscribe = asyncWrapSubscribe(subscribe)
  Observable.call(this, desc);
  assertFunction(subscribe);
  this.dispatcher = new Dispatcher(subscribe, handler);
  registerObs(this);
}

function asyncWrapSubscribe(subscribe) {
  var subscribing = false
  return function wrappedSubscribe(sink) {
    subscribing = true
    try {
      return subscribe(function wrappedSink(event) {
        if (subscribing && !event.isEnd()) {
          console.log("Stream responded synchronously")
        }
        return sink(event)
      })
    } finally {
      subscribing = false
    }
  }
}

function streamSubscribeToPropertySubscribe(initValue, streamSubscribe) {
  assertFunction(streamSubscribe)
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
      if (event.hasValue()) {
        if (event.isInitial() && !subbed) {
          initValue = new Some(event.value);
          return more;
        } else {
          if (!event.isInitial()) { sendInit(); }
          initSent = true;
          initValue = new Some(event.value);
          return sink(event);
        }
      } else {
        if (event.isEnd()) {
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
    return new EventStream(new Desc(this, "withHandler", [handler]), this.dispatcher.subscribe, handler);
  }
});

export { EventStream, streamSubscribeToPropertySubscribe };
