import EventStream from "./eventstream";
import { Desc } from "./describe";
import { nop } from "./helpers";

EventStream.prototype.concat = function(right) {
  var left = this;
  return new EventStream(new Desc(left, "concat", [right]), function(sink) {
    var unsubRight = nop;
    var unsubLeft = left.dispatcher.subscribe(function(e) {
      if (e.isEnd()) {
        unsubRight = right.dispatcher.subscribe(sink);
        return unsubRight;
      } else {
        return sink(e);
      }
    });
    return function() {
      return unsubLeft() , unsubRight();
    };
  });
};
