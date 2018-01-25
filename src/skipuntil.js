import "./map";
import "./sample";
import "./take";
import { withDesc, Desc } from "./describe";
import EventStream from "./eventstream";

EventStream.prototype.skipUntil = function(starter) {
  var started = starter.take(1).map(true).toProperty(false);
  return withDesc(new Desc(this, "skipUntil", [starter]), this.filter(started));
};
