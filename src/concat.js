import "./property";
import _ from "./_";
import EventStream from "./eventstream";
import Property from "./property";
import Bacon from "./core";
import { withDesc, Desc } from "./describe";
import { nop } from "./helpers";
import never from "./never"
import addPropertyInitValueToStream from "./addpropertyinitialvaluetostream";
import { argumentsToObservables } from "./argumentstoobservables";

EventStream.prototype.concat = function(right, options) {
  var left = this;
  return new EventStream(new Desc(left, "concat", [right]), function(sink) {
    var unsubRight = nop;
    var unsubLeft = left.dispatcher.subscribe(function(e) {
      if (e.isEnd) {
        unsubRight = right.toEventStream().dispatcher.subscribe(sink);
        return unsubRight;
      } else {
        return sink(e);
      }
    });
    return function() {
      return unsubLeft() , unsubRight();
    };
  }, null, options);
}

Property.prototype.concat = function(right) {
  return addPropertyInitValueToStream(this, this.changes().concat(right))
}

Bacon.concatAll = function() {
  var streams = argumentsToObservables(arguments);
  if (streams.length) {
    return withDesc(
      new Desc(Bacon, "concatAll", streams),
      _.fold(_.tail(streams), _.head(streams).toEventStream(), (a, b) => a.concat(b))    
    )
  } else {
    return never();
  }
}
