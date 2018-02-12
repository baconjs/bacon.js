import EventStream from "./eventstream";
import Property from "./property";
import { defaultOptions } from "./eventstream";
import { Desc } from "./describe";

Property.prototype.toEventStream = function(options = defaultOptions) {
  return new EventStream(
    new Desc(this, "toEventStream", []), 
    (sink) => this.dispatcher.subscribe(function(event) { return sink(event.toNext()); }),
    null,
    options
  );
}
