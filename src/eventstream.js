import Observable from "./observable";
import { Desc } from "./describe";
import { inherit, extend, nop, assertFunction } from "./helpers";
import { registerObs } from "./spy";
import { more, noMore } from "./reply";
import { None, Some, toOption } from "./optional";
import Property from "./property";
import Bacon from "./core";
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
  Observable.call(this, desc);
  assertFunction(subscribe);
  this.dispatcher = new Dispatcher(subscribe, handler);
  registerObs(this);
}

inherit(EventStream, Observable);
extend(EventStream.prototype, {
  _isEventStream: true,

  toProperty(initValue_) {
    var initValue = arguments.length === 0 ? None : toOption(function() { return initValue_; });
    var disp = this.dispatcher;
    var desc = new Desc(this, "toProperty", [initValue_]);
    return new Property(desc, function(sink) {
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

      unsub = disp.subscribe(function(event) {
        if (event.hasValue()) {
          if (event.isInitial() && !subbed) {
            initValue = new Some(() => event.value());
            return more;
          } else {
            if (!event.isInitial()) { sendInit(); }
            initSent = true;
            initValue = new Some(event);
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
    );
  },

  toEventStream() { return this; },

  withHandler(handler) {
    return new EventStream(new Desc(this, "withHandler", [handler]), this.dispatcher.subscribe, handler);
  }
});

export { EventStream };
