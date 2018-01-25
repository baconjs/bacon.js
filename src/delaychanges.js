import addPropertyInitValueToStream from "./addpropertyinitialvaluetostream";
import { withDesc } from "./describe";
import Property from "./property";
import EventStream from "./eventstream";

Property.prototype.delayChanges = function(desc, f) {
  return withDesc(desc, addPropertyInitValueToStream(this, f(this.changes())))
}

EventStream.prototype.delayChanges = function(desc, f) {
  return withDesc(desc, f(this))
}
