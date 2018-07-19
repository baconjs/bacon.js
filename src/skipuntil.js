import "./map";
import "./sample";
import "./take";
import { Desc } from "./describe";
import { EventStream } from "./observable";

EventStream.prototype.skipUntil = function(starter) {
  var started = starter.take(1).map(true).toProperty(false);
  return this.filter(started).withDesc(new Desc(this, "skipUntil", [starter]));
};
